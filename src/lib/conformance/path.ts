import * as z from "zod";
import {
  Level,
  levels,
  purepy_outcomes,
  PurePyOutcome,
  python_outcomes,
  PythonOutcome,
} from "#lib/conformance/types.ts";

export const TestPath = z.tuple(
  [Level, PythonOutcome, PurePyOutcome],
  z.string(),
);

export const parse_path = (path: string) => {
  return TestPath.parse(path.split("/"));
};

// temporary
export const group = (paths: string[]) => {
  return levels
    .map((level) => {
      return {
        level,
        level_groups: python_outcomes
          .map((python_outcome) => {
            return {
              python_outcome,
              python_outcome_groups: purepy_outcomes
                .map((purepy_outcome) => {
                  const prefix = `${level}/${python_outcome}/${purepy_outcome}/`;
                  const filtered = paths.filter((path) =>
                    path.startsWith(prefix),
                  );
                  const tests = filtered.map((path) => {
                    return {
                      path,
                      name: path.slice(prefix.length),
                    };
                  });
                  return {
                    purepy_outcome,
                    tests,
                  } as const;
                })
                .filter((x) => x.tests.length !== 0),
            } as const;
          })
          .filter((x) => x.python_outcome_groups.length !== 0),
      } as const;
    })
    .filter((x) => x.level_groups.length !== 0);
};
