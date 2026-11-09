/*
 * JSON serialisation
 */

// 1. Returns `unknown` for valid JSON. Otherwise,
//    this would return `any`, which is abonimable.
// 2. Returns `null` for invalid JSON. Otherwise,
//    this would throw an exception. This handling
//    is mostly for convenience, rather than safety.
const safe_json_parse = (string: string) => {
  try {
    return JSON.parse(string) as unknown;
  } catch {
    return null;
  }
};

export const object_to_bytes = (object: unknown) => {
  const string = JSON.stringify(object);
  return new TextEncoder().encode(string);
};

export const bytes_to_object = (bytes: Uint8Array<ArrayBuffer>) => {
  const string = new TextDecoder().decode(bytes);
  return safe_json_parse(string);
};

/*
 * Compression
 */

type Stream<T> = {
  readonly readable: ReadableStream<T>;
  readonly writable: WritableStream<T>;
};

const pipe_stream = async (
  bytes: Uint8Array<ArrayBuffer>,
  { readable, writable }: Stream<Uint8Array<ArrayBuffer>>,
) => {
  const writer = writable.getWriter();
  writer.write(bytes);
  writer.close();

  const final = await new Response(readable).bytes();
  return final;
};

export const deflate_bytes = async (bytes: Uint8Array<ArrayBuffer>) => {
  return pipe_stream(bytes, new CompressionStream("deflate-raw"));
};

export const inflate_bytes = async (bytes: Uint8Array<ArrayBuffer>) => {
  return pipe_stream(bytes, new DecompressionStream("deflate-raw"));
};

/*
 * Versioning
 */

export const prepend_version = (version: number, payload: Uint8Array) => {
  const bytes = new Uint8Array(payload.length + 1);
  bytes[0] = version;
  bytes.set(payload, 1);
  return bytes;
};

export const split_version = (bytes: Uint8Array<ArrayBuffer>) => {
  return [bytes[0], bytes.slice(1)] as const;
};

/*
 * URL encoding
 */

export const bytes_to_url = (bytes: Uint8Array<ArrayBuffer>) => {
  if (bytes.toBase64 === undefined) {
    // FIXME: this API is relatively new, so we should consider a polyfill
    throw new Error("Unsupported browser");
  }
  return bytes.toBase64({ alphabet: "base64url" });
};

export const url_to_bytes = (encoded: string) => {
  if (Uint8Array.fromBase64 === undefined) {
    // FIXME: this API is relatively new, so we should consider a polyfill
    throw new Error("Unsupported browser");
  }
  return Uint8Array.fromBase64(encoded, { alphabet: "base64url" });
};
