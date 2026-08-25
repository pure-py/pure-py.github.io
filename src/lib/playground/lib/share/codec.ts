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
  bytes_to_object,
  bytes_to_url,
  deflate_bytes,
  inflate_bytes,
  object_to_bytes,
  prepend_version,
  split_version,
  url_to_bytes,
} from "./utils";

export type Version = (typeof VERSIONS)[number];
const VERSIONS = [0] as const;
const VERSION = 0;

const is_valid_version = (version: number): version is Version =>
  VERSIONS.some((valid_version) => version === valid_version);

export type EncodedState = {
  version: Version;
  payload: Uint8Array<ArrayBuffer>;
};

const SharableFile = z.object({
  path: z.string(),
  data: z.string(),
});

export type SharableState = z.infer<typeof SharableState>;
export const SharableState = z.object({
  files: z.tuple([SharableFile], SharableFile),
});

export const set_encoded_state = (
  url: URL,
  payload: Uint8Array<ArrayBuffer>,
) => {
  url = new URL(url);
  const versioned_bytes = prepend_version(VERSION, payload);
  const encoded = bytes_to_url(versioned_bytes);
  url.hash = `#${encoded}`;
  return url;
};

export const encode_state = async (state: SharableState) => {
  // these parts, including the parameter type, can be changed
  // if necessary with proper version handling
  const raw_bytes = object_to_bytes(state);
  const deflated_bytes = await deflate_bytes(raw_bytes);
  return deflated_bytes;
};

// this part is sacred and cannot change
export const get_encoded_state = (url: URL) => {
  if (url.hash === "") {
    return null;
  }
  // non-empty hash is prefixed with #
  const fragment = url.hash.replace(/^#/, "");
  const versioned_bytes = url_to_bytes(fragment);
  const [version, payload] = split_version(versioned_bytes);

  if (!is_valid_version(version)) {
    throw new Error("Unsupported encoding");
  }

  return { version, payload };
};

export const decode_state = async (
  version: Version,
  payload: Uint8Array<ArrayBuffer>,
) => {
  const raw_bytes = await inflate_bytes(payload);
  const object = bytes_to_object(raw_bytes);
  return SharableState.parse(object);
};
