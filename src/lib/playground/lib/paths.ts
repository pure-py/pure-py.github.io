export const RESERVED_PYODIDE_PATHS = new Set([
  "parse.py",
  "check_module.py",
  "reasons.py",
]);

const SEGMENT_PATTERN = /^[A-Za-z0-9._-]+$/;

export const validate_filename = (path: string) => {
  const segments = path.split("/");

  if (segments.some((segment) => segment === "")) {
    throw new Error(`Invalid path: “${path}” cannot be empty`);
  }

  if (!segments.every((segment) => SEGMENT_PATTERN.test(segment))) {
    throw new Error(
      `Invalid path: “${path}” must use letters, numbers, dots, underscores, or hyphens; separate folders with a forward slash`,
    );
  }

  if (RESERVED_PYODIDE_PATHS.has(path)) {
    throw new Error(`Reserved path: “${path}” is used by PurePy`);
  }
};
