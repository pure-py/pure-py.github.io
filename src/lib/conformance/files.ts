import { build_registry } from "#lib/server/conformance.ts";

const conformance_suite = import.meta.glob<string>("./**/*", {
  eager: true,
  query: "?url",
  import: "default",
  base: "../../../pure-py-spec/src/purepy/conformance-suite",
});

export const registry = await build_registry(conformance_suite);
