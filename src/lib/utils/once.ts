const once_map = new Set<symbol>();

// TODO: what is the point in the map?
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

export const once_promise = <A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
) => {
  let _promise: Promise<R>;
  return (...args: A) => {
    if (_promise !== undefined) {
      return _promise;
    }
    _promise = fn(...args);
    return _promise;
  };
};
