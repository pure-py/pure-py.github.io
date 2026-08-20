import * as z from "zod/mini";
import parse_py from "$lib/assets/parse.py?raw";
import check_module_py from "$lib/assets/check_module.py?raw";
import reasons_py from "$lib/assets/reasons.py?raw";
// we deliberately only loading the type here, and later
// lazy-load the full import during initialisation, to improve
// loading experience on slower connections
import { type PyodideAPI } from "pyodide";
import type { Stdout } from "./stdout.svelte";

const PurePyError = z.object({
  msg: z.string(),
  line: z.optional(z.number()),
  col: z.optional(z.number()),
});

const capture_err = (fn: () => unknown) => {
  const result = fn();

  // result is None
  if (result === undefined) {
    return { success: true } as const;
  }

  const error = PurePyError.parse(result);

  return { success: false, error } as const;
};

export class PurePy {
  private pyodide: PyodideAPI;

  constructor(pyodide: PyodideAPI) {
    this.pyodide = pyodide;
    pyodide.FS.writeFile("parse.py", parse_py);
    pyodide.FS.writeFile("check_module.py", check_module_py);
    pyodide.FS.writeFile("reasons.py", reasons_py);
  }

  static load = async () => {
    const { loadPyodide } = await import("pyodide");
    const pyodide = await loadPyodide();
    return new PurePy(pyodide);
  };

  attach_stdout = (stdout: Stdout) => {
    this.pyodide.setStdout({ batched: stdout.write });

    this.pyodide.setStderr({ batched: stdout.write_err });
  };

  write_file = (path: string, src: string) => {
    this.pyodide.FS.writeFile(path, src);
    return path;
  };

  run = (src: string) => {
    try {
      const result: unknown = this.pyodide.runPython(src);
      return result;
    } catch (error) {
      // something went wrong in Python/Pyodide
      console.error(error);
      return {
        msg: "Unhandled exception (see console)",
      };
    }
  };

  parse = (path: string) =>
    capture_err(() =>
      this.run(`
        import parse
        def fn():
          try:
            parse.check_file("${path}")
          except SyntaxError as err:
            return {
              "msg": "Syntax error",
              "line": err.lineno,
              "col": err.offset
            }
        fn()
      `),
    );

  check = (path: string) =>
    capture_err(() =>
      this.run(`
        import ast
        import check_module
        check_module.check_file("${path}")
      `),
    );

  parse_and_check = (src: string) => {
    const path = this.write_file("whatever.purepy", src);

    const parse_result = this.parse(path);
    if (!parse_result.success) {
      return parse_result;
    }

    const check_result = this.check(path);
    if (!check_result.success) {
      return check_result;
    }

    return { success: true, error: null } as const;
  };

  evaluate = (src: string) => {
    const result = this.run(src);
    return { success: true, output: result } as const;
  };
}
