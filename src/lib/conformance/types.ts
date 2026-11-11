import * as z from "zod/mini";

export type ConformanceTest = {
  python_outcome: PythonOutcome;
  purepy_outcome: PurePyOutcome;
  test: string;
};

export const python_outcomes = [
  "python-raises",
  "python-rejects",
  "python-succeeds",
] as const;
export type PythonOutcome = z.infer<typeof PythonOutcome>;
export const PythonOutcome = z.enum(python_outcomes);

export const purepy_outcomes = [
  "agrees",
  "excluded-for-now",
  "parser-rejects",
  "typing-rejects",
  "undefined",
] as const;
export type PurePyOutcome = z.infer<typeof PurePyOutcome>;
export const PurePyOutcome = z.enum(purepy_outcomes);
