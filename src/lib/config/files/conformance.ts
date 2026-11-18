import { build_registry } from "#lib/server/conformance.ts";

const conformance_suite = import.meta.glob<string>("./**/*", {
  eager: true,
  query: "?url",
  import: "default",
  base: "/src/vendor/python/purepy_conformance/conformance-suite",
});

const check = (records: Record<string, string>) => {
  if (Object.keys(records).length === 0) {
    throw new Error("Failed to load conformance suite source files.");
  }
  return records;
};

export const registry = await build_registry(check(conformance_suite));
