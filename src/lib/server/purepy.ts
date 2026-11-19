import { PUREPY_VERSION } from "#lib/playground/lib/purepy/version.js";

const implementation = import.meta.glob<string>(
  "../python/purepy-*.dist-info/METADATA",
  { query: "?raw", import: "default", eager: true },
);

const suite = import.meta.glob<string>(
  "../python/purepy_conformance-*.dist-info/METADATA",
  { query: "?raw", import: "default", eager: true },
);

// Installed version of a distribution
const installed_version = (
  distribution: string,
  metadata: Record<string, string>,
) => {
  const versions = Object.values(metadata).map(
    (file) => file.match(/^Version: (.*)$/m)?.[1],
  );

  if (versions.length !== 1 || versions[0] === undefined) {
    throw new Error(
      `Distribution ${distribution} installed ${versions.length} times`,
    );
  }

  return versions[0];
};

// Specification version of the installed reference implementation
export const SPEC_VERSION = installed_version("purepy-conformance", suite);

export const check_pinned_version_installed = () => {
  const version = installed_version("purepy", implementation);

  if (version !== PUREPY_VERSION) {
    throw new Error(
      `Installed reference implementation ${version} differs from pinned version ${PUREPY_VERSION}`,
    );
  }
};
