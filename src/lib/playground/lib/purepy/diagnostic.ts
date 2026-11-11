import z from "zod";

const Simple = z
  .object({
    a: z.string(),
  })
  .transform((x) => x.a);

const Qualified = z.object({
  get a() {
    return z.union([Qualified, Simple]);
  },
  b: z.string(),
});

type Name = z.infer<typeof Name>;
const Name = z.union([Simple, Qualified]);

const join_name = (name: Name): string => {
  if (typeof name === "string") {
    return name;
  }
  return `${join_name(name.a)}.${name.b}`;
};

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

export const PurePyDiagnostic = z.object({
  outcome: z.string(),
  module: z.optional(Name.transform(join_name)),
  position: z.optional(Position),
  message: z.string(),
  judgement: z.optional(z.string()),
  rule: z.optional(z.string()),
});
