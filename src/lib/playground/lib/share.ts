// these are mostly convenience functions and subject to change

import {
  encode_state,
  get_encoded_state,
  set_encoded_state,
  SharableState,
} from "./share/codec";

export const url_with_params_from_state = async (
  url: URL,
  state: SharableState,
) => {
  url = new URL(url);
  const encoded = await encode_state(state);
  const new_url = set_encoded_state(url, encoded);
  return new_url;
};

export const params_from_url = (url: URL) => {
  try {
    const params = get_encoded_state(url);
    return params;
  } catch (error) {
    // some visual feedback may be nice
    console.error(error);
    return null;
  }
};
