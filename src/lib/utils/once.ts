const once_map = new Set<symbol>();

export const once = <A extends unknown[], R>(fn: (...args: A) => R) => {
  const symbol = Symbol();
  return (...args: A) => {
    if (once_map.has(symbol)) {
      return;
    }
    once_map.add(symbol);
    fn(...args);
  };
};
