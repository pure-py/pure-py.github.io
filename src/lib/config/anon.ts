import logo from "#lib/assets/image/logo.png";

export type SiteConfig = {
  name: string;
  logo: string;
  github: string | null;
  spec: string;
  favicon: string;
};

const NO_LOGO =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export const public_config = {
  name: "PurePy",
  logo,
  github: "https://github.com/pure-py/pure-py-spec",
  spec: "https://pure-py.github.io/pure-py-spec/latest/PurePy-spec.pdf",
  favicon: "/favicon.png",
} satisfies SiteConfig;

export const anon_config = {
  name: "OurLang",
  logo: NO_LOGO,
  github: null,
  spec: "/spec-anon.pdf",
  favicon: NO_LOGO,
} satisfies SiteConfig;
