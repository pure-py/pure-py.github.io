import {
  as_nonempty,
  nonempty_concat,
  nonempty_map,
} from "#lib/utils/non-empty.ts";

import conformance_init from "#vendor/python/purepy_conformance/__init__.py?raw";
import figure_numbers from "#vendor/python/purepy_conformance/figure-numbers.json?raw";
import check_wrapper from "#lib/python/check.py?raw";
import run_wrapper from "#lib/python/run.py?raw";

const checker_source = import.meta.glob<string>("./**/*.py", {
  query: "?raw",
  import: "default",
  eager: true,
  base: "/src/vendor/python/purepy",
});

const process = (source: Record<string, string>) => {
  const entries = as_nonempty(Object.entries(source));

  return nonempty_map(entries, ([file, data]) => {
    const path = file.replace(/^\./, "purepy");
    return { path, data } as const;
  });
};

export const checker_files = nonempty_concat(process(checker_source), [
  { path: "purepy_conformance/__init__.py", data: conformance_init },
  { path: "purepy_conformance/figure-numbers.json", data: figure_numbers },
  { path: "internal_helpers/check.py", data: check_wrapper },
  { path: "internal_helpers/run.py", data: run_wrapper },
]);

export const check_checker_source_exists = () => {
  if (Object.keys(checker_source).length === 0) {
    throw new Error(`Missing checker source files`);
  }
};
