import {
  params_to_state,
  SharableState,
  SharableStateParams,
  state_to_params,
} from "./share/codec";

export const url_with_params_from_src = async (url: URL, src: string) => {
  url = new URL(url);

  // since we don't actually support multiple files yet
  const state: SharableState = {
    files: [
      {
        path: "main.py",
        data: src,
      },
    ],
  };

  const encoded = await state_to_params(state);

  url.searchParams.set("v", encoded.version);
  url.searchParams.set("c", encoded.compression);
  url.searchParams.set("p", encoded.payload);

  return url;
};

export const params_from_url = (url: URL) => {
  try {
    const version = url.searchParams.get("v");
    const compression = url.searchParams.get("c");
    const payload = url.searchParams.get("p");

    // if only some are null, this should cause a parse error (below)
    if ([version, compression, payload].every((x) => x === null)) {
      return null;
    }

    const params = SharableStateParams.parse({ version, compression, payload });

    return params;
  } catch (error) {
    // some visual feedback may be nice
    console.error(error);
    return null;
  }
};

export const src_from_params = async (params: SharableStateParams) => {
  const state = await params_to_state(params);
  return state.files[0].data;
};
