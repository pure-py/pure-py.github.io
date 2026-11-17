import logo from "#lib/assets/image/logo.png";

export type SiteConfig = {
  name: string;
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
  logo,
  github: "https://github.com/pure-py/pure-py-spec",
  spec: "https://pure-py.github.io/pure-py-spec/latest/PurePy-spec.pdf",
  favicon: "/favicon.png",
  languages: [
    { name: "Fluid", url: "https://f.luid.org" },
    { name: "Fortl", url: "https://github.com/plas4sci/fortl" },
  ],
} satisfies SiteConfig;

const spec_macros = import.meta.glob<string>("../spec/macros.tex", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Name given to a language by the specification macros in anonymous mode
const anonymised = (macro: string) => {
  const [macros] = Object.values(spec_macros);

  if (macros === undefined) {
    throw new Error(
      "Specification macros missing; run scripts/download-spec.sh with ANONYMOUS=true",
    );
  }

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
  name: "OurLang",
  logo: NO_LOGO,
  github: null,
  spec: "/spec-anon.pdf",
  favicon: NO_LOGO,
  languages: [
    { name: anonymised("Cosi"), url: null },
    { name: anonymised("Fluid"), url: null },
  ],
});
