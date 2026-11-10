const python_metadata = import.meta.glob(
  "#lib/python/purepy-*.dist-info/METADATA",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

export const read_version = () => {
  const entries = Object.entries(python_metadata);

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
