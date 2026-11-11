import { registry } from "#lib/conformance/files.js";
import { error } from "@sveltejs/kit";

export const load = async ({ params }) => {
  const test = registry.get(params.path);

  if (test === null) {
    return error(404, "Not found");
  }

  return {
    state: { files: test },
  };
};
