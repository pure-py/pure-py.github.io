import { registry } from "#lib/server/files/conformance.ts";

export const load = async () => {
  const tests = registry.list();

  return {
    tests,
  };
};
