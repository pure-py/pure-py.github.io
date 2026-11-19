import * as env from "$app/env/private";
import { anon_config, public_config } from "#lib/config/anon.js";

import { check_checker_source_exists } from "#lib/config/files/checker.ts";
import { check_example_source_exists } from "#lib/config/files/example.ts";
import { check_pinned_version_installed } from "#lib/config/files/version.ts";

export const load = () => {
  check_pinned_version_installed();
  check_checker_source_exists();
  check_example_source_exists();

  return {
    config: env.ANONYMOUS ? anon_config() : public_config,
  };
};
