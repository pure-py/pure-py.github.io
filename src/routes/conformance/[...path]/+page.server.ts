import { registry } from "#lib/conformance/files.js";
import { parse_path } from "#lib/conformance/path.js";
import { error } from "@sveltejs/kit";

export const load = async ({ params }) => {
  try {
    parse_path(params.path);
  } catch {
    return error(404, "Not found");
  }

  const test = registry.get(params.path);

  if (test === null) {
    return error(404, "Not found");
  }

  return {
    state: test,
  };
};
