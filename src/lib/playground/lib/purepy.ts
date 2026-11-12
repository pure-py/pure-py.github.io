// We deliberately only load the type here, and later lazy-load the full
// import during initialisation, to improve the loading experience on
// slower connections
import { type PyodideAPI } from "pyodide";
import type { Stdout } from "./stdout.svelte";
import type { ReadonlyFile } from "./file.svelte";
import { validate_filename, PUREPY_DIR } from "./paths";
import { PurePyCheckResult, PurePyEvalResult } from "./purepy/result";

import conformance_init from "#lib/python/purepy_conformance/__init__.py?raw";
import figure_numbers from "#lib/python/purepy_conformance/figure-numbers.json?raw";

const checker_sources = import.meta.glob<string>("#lib/python/purepy/**/*.py", {
  query: "?raw",
  import: "default",
  eager: true,
});

const checker_files = Object.fromEntries(
  Object.entries(checker_sources).map(([file, source]) => {
    const relative_path = file.replace(/^.*\/purepy?/, "purepy");
    return [relative_path, source];
  }),
);

export class PurePy {
  private pyodide: PyodideAPI;
  private stdout: Stdout | null = null;

  constructor(pyodide: PyodideAPI) {
    this.pyodide = pyodide;
    pyodide.setDebug(true);

    this.pyodide.FS.mkdirTree(PUREPY_DIR);

    const source_files = [
      ...Object.entries(checker_files),
      ["purepy_conformance/__init__.py", conformance_init],
      ["purepy_conformance/figure-numbers.json", figure_numbers],
    ];

    for (const [relative_path, source] of source_files) {
      const path = `${PUREPY_DIR}/${relative_path}`;
      const directory = path.split("/").slice(0, -1).join("/");

      this.pyodide.FS.mkdirTree(directory);
      this.pyodide.FS.writeFile(path, source);
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
      import pathlib
      import time

      from purepy.check_program import ( check_program )

      path = pathlib.Path("${path}")

      start = time.perf_counter_ns()
      diagnostic = check_program(path)
      end = time.perf_counter_ns()
      elapsed = (end - start) // 1_000_000 # milliseconds

      { "diagnostic": diagnostic, "elapsed": elapsed }
    `);

    const { diagnostic, elapsed } = PurePyCheckResult.parse(result);

    if (diagnostic === undefined) {
      return {
        success: true,
        time: elapsed,
      } as const;
    } else {
      return {
        success: false,
        time: elapsed,
        error: {
          file: path,
          line: diagnostic.position?.line ?? null,
          col: diagnostic.position?.col ?? null,
          message: diagnostic.message,
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
      // at this point we have already confirmed there is no parse
      // error but we don't have the parsed program, so we run it
      // again (a future version could reuse the check result here).
      // we can't use the existing `run_program` because it uses threads.
      // a program has no evaluation result except from the exit code
      // and the collection of print outputs which we have captured
      const result = this.run(`
        import pathlib
        from purepy.run_program import ( check, evaluate, Diagnostic, format_diagnostic, exit_code )

        def run_program(entry_path: pathlib.Path) -> int:
            match check(entry_path):
                case Diagnostic() as d:
                    print(format_diagnostic(d, entry_path))
                    return { "status": int(exit_code(d)), "elapsed": 0 }
                case (M, sigma):
                    pass

            start = time.perf_counter_ns()
            status = evaluate(sigma, M, [str(entry_path)], 100_000)
            end = time.perf_counter_ns()
            elapsed = (end - start) // 1_000_000 # milliseconds
            return { "status": status, "elapsed": elapsed }


        run_program(pathlib.Path("${file.path}"))
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
