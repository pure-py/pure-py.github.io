import * as z from "zod/mini";
// We deliberately only load the type here, and later lazy-load the full
// import during initialisation, to improve the loading experience on
// slower connections
import { type PyodideAPI } from "pyodide";
import type { Stdout } from "./stdout.svelte";
import type { ReadonlyFile } from "./file.svelte";
import { validate_filename, PUREPY_DIR } from "./paths";

import pyproject_toml from "pure-py-spec/pyproject.toml?raw";

const checker_sources = import.meta.glob<string>(
  "pure-py-spec/src/purepy/**/*.py",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

const checker_files = Object.fromEntries(
  Object.entries(checker_sources).map(([file, source]) => {
    const relative_path = file
      .replace(/^.*\/src\/purepy\//, "purepy/")
      .replace(/\?raw$/, "");

    return [relative_path, source];
  }),
);

const version_match = pyproject_toml.match(/^version\s*=\s*"([^"]+)"/m);

if (version_match === null) {
  throw new Error("Could not read version from pyproject.toml");
}

const purepy_version = version_match[1];

export const PUREPY_VERSION = purepy_version;
export const PUREPY_TAG = `v${purepy_version}`;

const CheckerError = z.object({
  file: z.optional(z.nullable(z.string())),
  line: z.optional(z.nullable(z.number())),
  col: z.optional(z.nullable(z.number())),
  msg: z.string(),
});

const CheckerResult = z.union([
  z.object({
    success: z.literal(true),
    errors: z.array(z.never()),
    message: z.string(),
  }),
  z.object({
    success: z.literal(false),
    errors: z.array(CheckerError),
    message: z.string(),
  }),
]);

export type CheckerError = z.infer<typeof CheckerError>;
export type CheckerResult = z.infer<typeof CheckerResult>;

export class PurePy {
  private pyodide: PyodideAPI;
  private stdout: Stdout | null = null;

  // The version of the bundled pure-py-spec submodule, read from its
  // pyproject.toml at build time.
  readonly version: string = PUREPY_VERSION;
  readonly tag: string = PUREPY_TAG;

  constructor(pyodide: PyodideAPI) {
    this.pyodide = pyodide;
    pyodide.setDebug(true);

    this.pyodide.FS.mkdirTree(PUREPY_DIR);

    for (const [relative_path, source] of Object.entries(checker_files)) {
      const path = `${PUREPY_DIR}/${relative_path}`;
      const directory = path.split("/").slice(0, -1).join("/");

      this.pyodide.FS.mkdirTree(directory);
      this.pyodide.FS.writeFile(path, source);
    }

    this.run(`
import sys

if "${PUREPY_DIR}" not in sys.path:
    sys.path.insert(0, "${PUREPY_DIR}")
    `);
  }

  static load = async (): Promise<PurePy> => {
    const { loadPyodide } = await import("pyodide");

    const pyodide = await loadPyodide({
      indexURL: `${import.meta.env.BASE_URL}pyodide/`,
    });

    return new PurePy(pyodide);
  };

  attach_stdout = (stdout: Stdout) => {
    this.stdout = stdout;

    this.pyodide.setStdout({ batched: stdout.write });
    this.pyodide.setStderr({ batched: stdout.write_err });
  };

  ensure_directory = (path: string) => {
    const directory = path.split("/").slice(0, -1).join("/");

    if (directory === "") {
      return;
    }

    this.pyodide.FS.mkdirTree(directory);
  };

  write_file = (file: ReadonlyFile) => {
    validate_filename(file.path);
    this.ensure_directory(file.path);
    this.pyodide.FS.writeFile(file.path, file.data);
  };

  delete_file = (file: ReadonlyFile) => {
    validate_filename(file.path);
    this.pyodide.FS.unlink(file.path);
  };

  rename_file = (old_file: ReadonlyFile, new_file: ReadonlyFile) => {
    validate_filename(old_file.path);
    validate_filename(new_file.path);

    this.ensure_directory(new_file.path);
    this.pyodide.FS.rename(old_file.path, new_file.path);
  };

  private format_python_error = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    const lines = message.trim().split("\n");

    const line_match = message.match(/File "<exec>", line (\d+)/);
    const line_number = line_match?.[1];

    const final_error = lines.at(-1) ?? message;

    return line_number ? `${final_error} (line ${line_number})` : final_error;
  };

  run = (src: string) => {
    try {
      const result: unknown = this.pyodide.runPython(src);
      return result;
    } catch (error) {
      console.error(error);

      this.stdout?.write_err(this.format_python_error(error));

      return {
        msg: "Unhandled exception (see console)",
      };
    }
  };

  check = (path: string): CheckerResult => {
    this.pyodide.globals.set("__purepy_path", path);

    const result = this.run(
      `
import json
import pathlib

from purepy.check_program import (
    check_program,
    error_path,
    format_program_result,
)

entry_path = pathlib.Path(__purepy_path)
checker_result = check_program(entry_path)
message = format_program_result(checker_result, entry_path)

if checker_result is None:
    checker_json = json.dumps({
        "success": True,
        "errors": [],
        "message": message,
    })
else:
    file = str(error_path(checker_result, entry_path))
    line = getattr(checker_result, "line", None)
    col = getattr(checker_result, "col", None)
    msg = checker_result.msg

    checker_json = json.dumps({
        "success": False,
        "errors": [{
            "file": file,
            "line": line,
            "col": col,
            "msg": msg,
        }],
        "message": message,
    })

checker_json
      `,
    );

    if (typeof result !== "string") {
      const message = "Checker returned an unexpected result";

      return {
        success: false,
        errors: [
          {
            file: path,
            line: null,
            col: null,
            msg: message,
          },
        ],
        message,
      };
    }

    try {
      return CheckerResult.parse(JSON.parse(result));
    } catch (error) {
      console.error("Invalid checker result:", result, error);

      const message = "Checker returned invalid JSON";

      return {
        success: false,
        errors: [
          {
            file: path,
            line: null,
            col: null,
            msg: message,
          },
        ],
        message,
      };
    }
  };

  parse_and_check = (file: ReadonlyFile): CheckerResult => {
    this.write_file(file);

    return this.check(file.path);
  };

  evaluate = (file: ReadonlyFile) => {
    try {
      const result: unknown = this.pyodide.runPython(file.data);

      return {
        success: true,
        output: result,
      } as const;
    } catch (error) {
      console.error(error);

      this.stdout?.write_err(
        `${file.path}: ${this.format_python_error(error)}`,
      );

      return {
        success: false,
        output: undefined,
      } as const;
    }
  };
}
