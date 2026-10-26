import * as z from "zod/mini";

export type ConformanceTest = {
  level: Level;
  python_outcome: PythonOutcome;
  purepy_outcome: PurePyOutcome;
  test: string;
};

export const levels = ["module-level", "program-level"] as const;
export type Level = z.infer<typeof Level>;
export const Level = z.enum(levels);

export const python_outcomes = [
  "syntax-error",
  "exception",
  "no-exception",
] as const;
export type PythonOutcome = z.infer<typeof PythonOutcome>;
export const PythonOutcome = z.enum(python_outcomes);

export const purepy_outcomes = [
  "parser",
  "type-checker",
  "undefined",
  "result",
] as const;
export type PurePyOutcome = z.infer<typeof PurePyOutcome>;
export const PurePyOutcome = z.enum(purepy_outcomes);
