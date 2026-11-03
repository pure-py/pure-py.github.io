declare global {
  namespace App {}

  // Uint8Array.prototype.toBase64()
  // MDN: Baseline 2025, "newly available".
  interface Uint8Array {
    toBase64?(options?: {
      alphabet?: "base64" | "base64url";
      omitPadding?: boolean;
    }): string;
  }

  // Uint8Array.fromBase64()
  // MDN: Baseline 2025, "newly available".
  interface Uint8ArrayConstructor {
    fromBase64(
      string: string,
      options?: {
        alphabet?: "base64" | "base64url";
        lastChunkHandling?: "loose" | "strict" | "stop-before-partial";
      },
    ): Uint8Array<ArrayBuffer>;
  }
}

export {};
