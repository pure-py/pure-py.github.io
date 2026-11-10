import z from "zod";

const Name = z
  .object({
    a: z.string(),
  })
  .transform((name) => name.a);

const Position = z
  .object({
    0: z.number(),
    1: z.optional(z.number()),
  })
  .transform((pos) => {
    return {
      line: pos[0],
      col: pos[1],
    };
  });

export const Diagnostic = z.object({
  outcome: z.string(),
  module: z.optional(Name),
  position: z.optional(Position),
  message: z.string(),
  judgement: z.optional(z.string()),
  rule: z.optional(z.string()),
});
