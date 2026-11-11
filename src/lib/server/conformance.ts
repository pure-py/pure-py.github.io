import { parse_path } from "#lib/conformance/path.ts";
import type { StaticFile } from "#lib/playground/lib/file.svelte.ts";
import { nonempty_map, type NonEmpty } from "#lib/utils/non-empty.ts";
import { read } from "$app/server";

const name_from_parts = (parts: string[], prefix: string[] = []): string => {
  if (parts.length === 0) {
    throw new Error("never");
  }

  const [part, ...rest] = parts!;

  if (rest.length === 0) {
    if (part === "main.py") {
      return prefix.join("/"); // we already have the name
    }

    const name = part.slice(0, -3); // without trailing `.py`
    return [...prefix, name].join("/");
  }

  return name_from_parts(rest, [...prefix, part]);
};

const parse_test_root = (path: string) => {
  if (path.startsWith("./")) {
    path = path.slice(2);
  }
  const [python_outcome, purepy_outcome, ...rest] = parse_path(path);
  const name = name_from_parts(rest);
  const key = `${python_outcome}/${purepy_outcome}/${name}`;
  return { python_outcome, purepy_outcome, name, key };
};

export const build_registry = async (records: Record<string, string>) => {
  const registry: Record<string, NonEmpty<StaticFile>> = {};
  const paths = Object.keys(records);

  for (const path of paths) {
    if (!path.endsWith(".py")) {
      continue;
    }

    const depth = path.split("/").length;

    const module_level_root = depth === 4 && !path.endsWith("main.py");
    const program_level_root = depth === 5 && path.endsWith("main.py");

    if (!module_level_root && !program_level_root) {
      continue;
    }

    if (module_level_root) {
      const root = parse_test_root(path);
      const content = await read(records[path]).text();
      const file = {
        path: root.name + ".py",
        data: content,
      } as const;

      registry[root.key] = [file] as const;
    } else if (program_level_root) {
      const root = parse_test_root(path);

      const prefix = `./${root.key}`;

      const related = paths.filter((other) => {
        return (
          other.startsWith(`./${root.key}`) &&
          other.endsWith(".py") &&
          other !== path
        );
      });

      const files = await Promise.all(
        nonempty_map([path, ...related], async (path) => {
          const content = await read(records[path]).text();
          return {
            path: path.slice(prefix.length + 1),
            data: content,
          } as const;
        }),
      );

      registry[root.key] = files;
    }
  }

  return {
    get: (path: string) => {
      const files = registry[path];
      if (files === undefined) {
        return null;
      }
      return files;
    },
    list: () => {
      return Object.keys(registry);
    },
  };
};
