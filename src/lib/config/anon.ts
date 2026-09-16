import logo from "$lib/assets/image/logo.png";

export const public_config = {
  name: "PurePy",
  logo: logo,
  github: "https://github.com/pure-py/pure-py-spec",
  spec: "https://github.com/pure-py/pure-py-spec/releases/latest",
  favicon: "/favicon.png",
} as const;

const NO_LOGO =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export const anon_config = {
  name: "This Project",
  logo: NO_LOGO,
  github: "https://github.com",
  spec: "https://github.com", // we need an anoymous spec
  favicon: NO_LOGO,
};
