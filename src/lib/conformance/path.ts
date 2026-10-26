import * as z from "zod";
import { Level, PurePyOutcome, PythonOutcome } from "#lib/conformance/types.ts";

export const Path = z.tuple([Level, PythonOutcome, PurePyOutcome, z.string()]);

export const parse_path_parts = (path: string[]) => {
  const [level, python_outcome, purepy_outcome, name] = Path.parse(path);

  return {
    level,
    python_outcome,
    purepy_outcome,
    name,
  };
};

export const parse_path = (path: string) => {
  return parse_path_parts(path.split("/"));
};
