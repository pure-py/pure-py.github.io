// these are mostly convenience functions and subject to change

import {
  decode_state,
  encode_state,
  get_encoded_state,
  set_encoded_state,
  SharableState,
  type EncodedState,
} from "./share/codec";

export const url_with_params_from_src = async (url: URL, src: string) => {
  // since we don't actually support multiple files yet
  const state: SharableState = {
    files: [
      {
        path: "main.py",
        data: src,
      },
    ],
  };

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

export const src_from_params = async (params: EncodedState) => {
  const state = await decode_state(params.version, params.payload);
  return state.files[0].data;
};
