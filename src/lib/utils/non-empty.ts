export type NonEmpty<A> = [A, ...A[]];

export const is_nonempty = <A>(arr: A[]): arr is NonEmpty<A> =>
  arr[0] !== undefined;

export const nonempty = <A>(arr: A[]): NonEmpty<A> => {
  if (is_nonempty(arr)) {
    return arr;
  }
  throw new Error("Array missing 0th element");
};

export const nonempty_map = <A, B>(arr: NonEmpty<A>, fn: (e: A) => B) =>
  arr.map((e) => fn(e)) as NonEmpty<B>;
