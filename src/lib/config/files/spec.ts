const spec_files = import.meta.glob<string>("./*", {
  query: "?raw",
  import: "default",
  eager: true,
  base: "/src/vendor/spec",
});

// Specification file downloaded for the anonymous build
export const spec_file = (name: string) => {
  const file = spec_files[`./${name}`];

  if (file === undefined) {
    throw new Error(`Specification file ${name} missing`);
  }

  return file;
};
