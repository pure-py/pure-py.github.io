// We deliberately only load the type here, and later lazy-load the full
// import during initialisation, to improve the loading experience on
// slower connections
import { type PyodideAPI } from "pyodide";
import type { Stdout } from "./stdout.svelte";
import type { ReadonlyFile } from "./file.svelte";
import { validate_filename, PUREPY_DIR } from "./paths";
import { PurePyCheckResult, PurePyEvalResult } from "./purepy/result";
import { checker_files } from "#lib/config/files/checker.ts";

export class PurePy {
  private pyodide: PyodideAPI;
  private stdout: Stdout | null = null;

  constructor(pyodide: PyodideAPI) {
    this.pyodide = pyodide;
    pyodide.setDebug(true);

    this.pyodide.FS.mkdirTree(PUREPY_DIR);

    for (const file of checker_files) {
      const path = `${PUREPY_DIR}/${file.path}`;
      const directory = path.split("/").slice(0, -1).join("/");

      this.pyodide.FS.mkdirTree(directory);
      this.pyodide.FS.writeFile(path, file.data);
    }

    this.pyodide.FS.mkdirTree("user");

    this.run(`
      import sys

      if "${PUREPY_DIR}" not in sys.path:
          sys.path.insert(0, "${PUREPY_DIR}")
    `);
  }

  static load = async (): Promise<PurePy> => {
    const { loadPyodide } = await import("pyodide");

    const pyodide = await loadPyodide({
      indexURL: `/pyodide`,
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

  check = (path: string) => {
    const result = this.run(`
      from internal_helpers.check import check
      check("${path}")
    `);

    const { error, elapsed } = PurePyCheckResult.parse(result);

    if (error === undefined) {
      return {
        success: true,
        time: elapsed,
      } as const;
    } else {
      return {
        success: false,
        time: elapsed,
        error: {
          file: error.file,
          line: error.diagnostic.position?.line ?? null,
          col: error.diagnostic.position?.col ?? null,
          message: error.diagnostic.message,
        },
      } as const;
    }
  };

  parse_and_check = (file: ReadonlyFile) => {
    this.write_file(file);

    return this.check(file.path);
  };

  evaluate = (file: ReadonlyFile) => {
    try {
      const result = this.run(`
        from internal_helpers.run import run
        run("${file.path}")
      `);

      const { status, elapsed } = PurePyEvalResult.parse(result);

      return {
        success: status === 0,
        elapsed,
      } as const;
    } catch (error) {
      console.error(error);

      this.stdout?.write_err(
        `${file.path}: ${this.format_python_error(error)}`,
      );

      return {
        success: false,
        elapsed: 0,
      } as const;
    }
  };
}
