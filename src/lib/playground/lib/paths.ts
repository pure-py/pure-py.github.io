export const CHECK_FILE_PATH = "__purepy_check__.purepy";

export const RESERVED_PYODIDE_PATHS = new Set([
  "parse.py",
  "check_module.py",
  "reasons.py",
  CHECK_FILE_PATH,
]);

const FILENAME_PATTERN = /^[A-Za-z0-9._-]+$/;

export const validate_filename = (path: string) => {
  if (!FILENAME_PATTERN.test(path)) {
    throw new Error(
      "Invalid filename: use letters, numbers, dots, underscores, or hyphens",
    );
  }

  if (RESERVED_PYODIDE_PATHS.has(path)) {
    throw new Error("This filename is reserved by PurePy");
  }
};
