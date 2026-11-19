import { PUREPY_VERSION } from "#lib/playground/lib/purepy/version.js";

const implementation = import.meta.glob<string>(
  "../python/purepy-*.dist-info/METADATA",
  { query: "?raw", import: "default", eager: true },
);

const suite = import.meta.glob<string>(
  "../python/purepy_conformance-*.dist-info/METADATA",
  { query: "?raw", import: "default", eager: true },
);

// Installed version of a package
const installed_version = (name: string, metadata: Record<string, string>) => {
  const [version, ...rest] = Object.values(metadata).map(
    (file) => file.match(/^Version: (.*)$/m)?.[1],
  );

  if (version === undefined || rest.length > 0) {
    throw new Error(
      `Expected one installed version of package ${name}, found ${Object.keys(metadata).length}`,
    );
  }

  return version;
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
