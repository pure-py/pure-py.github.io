// these are mostly convenience functions and subject to change

import type { ReadonlyURL } from "$app/state";
import {
  encode_state,
  get_encoded_state,
  encoded_state_to_url_hash,
  SharableState,
} from "./share/codec";

export const url_with_params_from_state = async (
  url: ReadonlyURL,
  state: SharableState,
) => {
  const encoded = await encode_state(state);
  const new_url = new URL(url.origin);
  new_url.pathname = "/playground";
  new_url.hash = encoded_state_to_url_hash(encoded);
  return new_url;
};

export const params_from_url = (url: ReadonlyURL) => get_encoded_state(url);
