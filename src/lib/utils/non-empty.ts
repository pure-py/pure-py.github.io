// N.B. our definition of nonempty is that the first
// element is not undefined, which is distinct from arr.length === 0
export type NonEmpty<A> = [A, ...A[]];

export const nonempty_map = <A, B>(arr: NonEmpty<A>, fn: (e: A) => B) =>
  arr.map((e) => fn(e)) as NonEmpty<B>;
