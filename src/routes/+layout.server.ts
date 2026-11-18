import * as env from "$app/env/private";
import { anon_config, public_config } from "#lib/config/anon.js";
import { check_installation } from "#lib/server/purepy.js";

export const load = () => {
  check_installation();

  return {
    config: env.ANONYMOUS ? anon_config() : public_config,
  };
};
