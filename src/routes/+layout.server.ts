import * as env from "$app/env/private";
import { anon_config, public_config } from "$lib/config/anon";

export const load = () => {
  return {
    config: env.ANONYMOUS ? anon_config : public_config,
  };
};
