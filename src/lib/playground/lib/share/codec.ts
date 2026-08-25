// The state is encoded in the URL hash fragment as:
// /playground#e215OiBvYmplY3QgaXMgdm...
//
// The first byte of the hash represents a version number, this can be
// used to distinguish different encoding/compression methods, and/or
// if there are breaking changes in the state data object. The rest of
// the hash contains the state data object encoded per the version.
//
// When making any changes here, we should be mindful to keep
// the structure flexible such that it is easy to add new properties
// without breaking backwards capability. We should also avoid breaking
// compatibility whenever possible. If it is not possible, we should
// write a new parser/validator with a different version number.
//
// Be aware that breaking changes can occur both in the state data object
// and in the encoding.

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
  url.hash = `#share=${encoded}`;
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
  const fragment = url.hash.replace(/^#(share=)?/, "");
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
