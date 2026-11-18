import { as_nonempty, nonempty_map } from "#lib/utils/non-empty.ts";

const example_source = import.meta.glob("./**/*.py", {
  query: "?raw",
  import: "default",
  eager: true,
  base: "/src/lib/python/example",
});

const process = (source: Record<string, string>) => {
  const entries = as_nonempty(Object.entries(source));

  return nonempty_map(entries, ([file, data]) => {
    const path = file.replace(/^\.\//, "");
    return { path, data } as const;
  }).sort((a, b) => a.path.localeCompare(b.path));
};

export const example_files = process(example_source);

export const check_example_source_exists = () => {
  if (Object.keys(example_source).length === 0) {
    throw new Error("Missing example source files");
  }
};
