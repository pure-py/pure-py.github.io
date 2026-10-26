import * as z from "zod";
import { Level, PurePyOutcome, PythonOutcome } from "#lib/conformance/types.ts";

export const TestPath = z.tuple(
  [Level, PythonOutcome, PurePyOutcome],
  z.string(),
);

export const parse_path = (path: string) => {
  return TestPath.parse(path.split("/"));
};
