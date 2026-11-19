const suite = import.meta.glob<string>(
  "./purepy_conformance-*.dist-info/METADATA",
  { query: "?raw", import: "default", eager: true, base: "/src/vendor/python" },
);

const version = Object.values(suite)[0]?.match(/^Version: (.*)$/m)?.[1];

if (version === undefined) {
  throw new Error("Conformance suite not installed");
}

// Specification version of the installed reference implementation
export const SPEC_VERSION = version;
