import logo from "#lib/assets/image/logo.png";
import { PUREPY_VERSION } from "#lib/playground/lib/purepy/version.js";

export type SiteConfig = {
  name: string;
  // Pinned version of specification and reference implementation
  version: string;
  logo: string;
  github: string | null;
  spec: string;
  favicon: string;
  languages: { name: string; url: string | null }[];
};

const NO_LOGO =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export const public_config = {
  name: "PurePy",
  version: PUREPY_VERSION,
  logo,
  github: "https://github.com/pure-py/pure-py-spec",
  spec: `https://pure-py.github.io/pure-py-spec/v${PUREPY_VERSION}/PurePy-spec.pdf`,
  favicon: "/favicon.png",
  languages: [
    { name: "Fluid", url: "https://f.luid.org" },
    { name: "Fortl", url: "https://github.com/plas4sci/fortl" },
  ],
} satisfies SiteConfig;

const spec_files = import.meta.glob<string>("../spec/*", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Specification file downloaded for the anonymous build
const spec_file = (name: string) => {
  const file = spec_files[`../spec/${name}`];

  if (file === undefined) {
    throw new Error(`Specification file ${name} missing`);
  }

  return file;
};

// Name given to a language by the specification macros in anonymous mode
const anonymised = (macro: string) => {
  const macros = spec_file("macros.tex");

  const definition = macros
    .slice(macros.indexOf("\\ifdefined\\anonmode"), macros.indexOf("\\else"))
    .match(
      new RegExp(`\\\\newcommand\\*\\{\\\\${macro}\\}\\{(.*)\\\\xspace\\}`),
    );

  if (definition === null) {
    throw new Error(
      `Anonymised name of \\${macro} undefined in specification macros`,
    );
  }

  return definition[1]!;
};

export const anon_config = (): SiteConfig => ({
  name: spec_file("anon-name").trim(),
  version: PUREPY_VERSION,
  logo: NO_LOGO,
  github: null,
  spec: "/spec-anon.pdf",
  favicon: NO_LOGO,
  languages: [
    { name: anonymised("Cosi"), url: null },
    { name: anonymised("Fluid"), url: null },
  ],
});
