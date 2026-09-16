import { defineEnvVars } from "@sveltejs/kit/env";

import { z } from "zod";

export const variables = defineEnvVars({
  ANONYMOUS: {
    public: false, // this should only be used serverside to ensure no leakage
    static: true,
    schema: z
      .string()
      .optional()
      .transform((x) => x === "true"),
  },
});
