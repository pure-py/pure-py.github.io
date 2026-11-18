// N.B. our definition of nonempty is that the first
// element is not undefined, which is distinct from arr.length === 0
export type NonEmpty<A> = [A, ...A[]];

export const is_nonempty = <A>(arr: A[]): arr is NonEmpty<A> =>
  arr.length > 0 && arr[0] !== undefined;

export const as_nonempty = <A>(arr: A[]): NonEmpty<A> => {
  if (!is_nonempty(arr)) {
    throw new Error("Cannot cast an empty array to NonEmpty");
  }

  return arr;
};

export const nonempty_map = <A, B>(arr: NonEmpty<A>, fn: (e: A) => B) =>
  arr.map((e) => fn(e)) as NonEmpty<B>;

export const nonempty_concat = <A>(
  a: NonEmpty<A>,
  b: NonEmpty<A>,
): NonEmpty<A> => [...a, ...b];
