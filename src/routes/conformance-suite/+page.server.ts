import { registry } from "#lib/config/files/conformance.ts";

export const load = async () => {
  const tests = registry.list();

  return {
    tests,
  };
};
