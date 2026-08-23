// The state is encoded in the URL in three parts, e.g.
// /playground?v=0&c=1&p=e215OiBvYmplY3QgaXMgdm...
//
// The `v` (version) parameter specifies the encoding, which allows us
// to support multiple different encodings, which is probably
// only useful if we need to make backwards incompatible changes.
//
// The 'c' (compression) parameter tells us if compression is used. This will
// typically be the case, but given so we have the option to selectively
// skip compression without needing to handle a different encoding
// version.
//
// The 'p' (payload) paramater is the URL-friendly encoding of our state data.
//
// When making any changes here, we should be mindful to keep
// the structure flexible such that it is easy to add new properties
// without breaking backwards capability. We should also avoid breaking
// compatibility whenever possible. If it is not possible, we should
// write a new parser/validator with a different version number.
//
// Rather than encode the directory structure through nested
// objects/arrays, for the sake of simplicity, we only worry
// about files here and represent any hierarchy through paths.
//
// Be aware that breaking changes can occur in the object structure
// and in its serialisation.

import { z } from "zod/mini";

import {
  bytes_to_url,
  deflate_bytes,
  bytes_to_object,
  object_to_bytes,
  url_to_bytes,
  inflate_bytes,
} from "./utils";

export type Version = (typeof VERSIONS)[number];
export const VERSIONS = ["0"] as const;

const SharableFile = z.object({
  path: z.string(),
  data: z.string(),
});

export type SharableState = z.infer<typeof SharableState>;
export const SharableState = z.object({
  files: z.tuple([SharableFile], SharableFile),
});

export type SharableStateParams = z.infer<typeof SharableStateParams>;
export const SharableStateParams = z.object({
  version: z.literal(VERSIONS),
  compression: z.literal("1"),
  payload: z.string(),
});

export const state_to_params = async (
  state: SharableState,
): Promise<SharableStateParams> => {
  const raw = object_to_bytes(state);
  const deflated = await deflate_bytes(raw);
  const encoded = bytes_to_url(deflated);
  return { version: "0", compression: "1", payload: encoded } as const;
};

export const params_to_state = async ({
  payload,
}: SharableStateParams): Promise<SharableState> => {
  const decoded = url_to_bytes(payload);
  const inflated = await inflate_bytes(decoded);
  const object = bytes_to_object(inflated);
  return SharableState.parse(object);
};
