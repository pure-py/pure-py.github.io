export const PUREPY_DIR = "/__purepy__";

const RESERVED_PREFIX = `${PUREPY_DIR}/`;

const SEGMENT_PATTERN = /^[A-Za-z0-9._-]+$/;

export const validate_filename = (path: string) => {
  const segments = path.split("/");

  if (segments.some((segment) => segment === "")) {
    throw new Error(
      `Invalid path: “${path}” cannot contain empty path segments`,
    );
  }

  if (segments.some((segment) => !SEGMENT_PATTERN.test(segment))) {
    throw new Error(
      `Invalid path: “${path}” must use letters, numbers, dots, underscores, or hyphens; separate folders with a forward slash`,
    );
  }

  if (segments.some((segment) => /^\.+$/.test(segment))) {
    throw new Error(
      `Invalid path: “${path}” cannot contain a path segment made only of dots`,
    );
  }

  if (path === PUREPY_DIR || path.startsWith(RESERVED_PREFIX)) {
    throw new Error(`Reserved path: “${path}” is used by PurePy`);
  }
};
