import { PUREPY_VERSION } from "#lib/playground/lib/purepy/version.js";

const metadata = import.meta.glob<string>(
  "../python/purepy-*.dist-info/METADATA",
  { query: "?raw", import: "default", eager: true },
);

export const check_pinned_version_installed = () => {
  const versions = Object.values(metadata).map(
    (file) => file.match(/^Version: (.*)$/m)?.[1],
  );

  if (versions.length !== 1 || versions[0] !== PUREPY_VERSION) {
    throw new Error(
      `Installed reference implementation [${versions.join(", ")}] differs from pinned version ${PUREPY_VERSION}`,
    );
  }
};
