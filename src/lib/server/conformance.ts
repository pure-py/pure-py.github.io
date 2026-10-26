import type { StaticFile } from "#lib/playground/lib/file.svelte.ts";
import { type NonEmpty } from "#lib/utils/non-empty.ts";
import { read } from "$app/server";

const normalise = (key: string) => {
  const file = key.slice(2); // remove leading `./`

  const [level, python_outcome, purepy_outcome, name_w_ext, ...rest] =
    file.split("/");

  const [name] = name_w_ext.split(".");

  return {
    test_name: `${level}/${python_outcome}/${purepy_outcome}/${name}`,
    file_name: rest.length ? rest.join("/") : name_w_ext,
  };
};

const best_safe_index = (files: NonEmpty<StaticFile>) => {
  if (files.length === 1) {
    return 0;
  }
  const main_index = files.findIndex((file) => file.path === "main.py");
  return main_index === -1 ? 0 : main_index;
};

export const build_registry = async (records: Record<string, string>) => {
  const registry: Record<string, NonEmpty<StaticFile>> = {};
  for (const key in records) {
    // the structure of this one is a bit different and
    // needs special handling
    if (key.includes("syntactic-only")) {
      continue;
    }

    // for now we will ignore .expected etc, but keep
    // them close by
    if (!key.endsWith(".py")) {
      continue;
    }

    const { test_name, file_name } = normalise(key);
    const files = registry[test_name] ?? [];
    const content = await read(records[key]).text();
    const file = {
      path: file_name,
      data: content,
    } as const;
    registry[test_name] = [...files, file];
  }

  return {
    get: (path: string) => {
      const files = registry[path];
      if (files === undefined) {
        return null;
      }
      const active_index = best_safe_index(files);
      return { files, active_index };
    },
  };
};
