import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    paths: { base: process.env.BASE_PATH ?? "" },
    experimental: {
      explicitEnvironmentVariables: true,
    },
  },
};

export default config;
