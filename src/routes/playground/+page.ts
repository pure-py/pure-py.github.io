import { params_from_url } from "#lib/playground/lib/share.ts";
import { decode_state } from "#lib/playground/lib/share/codec.ts";
import { browser } from "$app/env";
import { page } from "$app/state";

const get_state = async () => {
  const params = params_from_url(page.url);

  if (params === null) {
    return null;
  }

  const state = await decode_state(params.version, params.payload);

  return state;
};

export const load = async () => {
  if (!browser) {
    return { state: null, error: null };
  }

  try {
    const state = await get_state();
    return { state, error: null };
  } catch (error) {
    console.error(error);
    return { state: null, error };
  }
};
