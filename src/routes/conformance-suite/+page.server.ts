import { registry } from "#lib/conformance/files.js";

export const load = async () => {
  const tests = registry.list();

  return {
    tests,
  };
};
