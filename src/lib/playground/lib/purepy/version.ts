// Read the PurePy version from the uv/pip installation dir.
// This is a convenient check that we have installed PurePy and
// should fail at build if not. We might consider moving this to
// a server route to ensure this only runs at build.

const python_metadata = import.meta.glob(
  "#lib/python/purepy-*.dist-info/METADATA",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

const read_version = (records: Record<string, string>) => {
  const entries = Object.entries(records);

  if (entries.length === 0) {
    throw new Error("Unable to find PurePy installation metadata");
  }

  if (entries.length > 1) {
    throw new Error("Expected single PurePy METADATA file");
  }

  const version_match = entries[0]![1].match(/^Version: (\d+\.\d+\.\d+)$/m);

  if (version_match === null) {
    throw new Error("Unable to read version from PurePy METADATA file");
  }

  return version_match[1]!;
};

export const PUREPY_VERSION = read_version(python_metadata);
