// N.B. our definition of nonempty is that the first
// element is not undefined, which is distinct from arr.length === 0
export type NonEmpty<A> = [A, ...A[]];

export const to_nonempty = <A>(arr: A[]): NonEmpty<A> => {
  if (arr.length === 0 || arr[0] === undefined) {
    throw new Error("Cannot convert an empty array to NonEmpty");
  }

  return arr as NonEmpty<A>;
};

export const nonempty_map = <A, B>(arr: NonEmpty<A>, fn: (e: A) => B) =>
  arr.map((e) => fn(e)) as NonEmpty<B>;
