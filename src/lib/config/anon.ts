import logo from "$lib/assets/image/logo.png";

export type SiteConfig = {
  name: string;
  logo: string;
  github: string;
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
  name: "This Project",
  logo: NO_LOGO,
  github: "https://github.com",
  spec: "https://github.com", // Replace once an anonymous spec URL exists.
  favicon: NO_LOGO,
} satisfies SiteConfig;
