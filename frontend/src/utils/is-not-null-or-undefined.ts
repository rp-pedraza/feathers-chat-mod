const isNotNullOrUndefined = <T>(value: T): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};

export default isNotNullOrUndefined;
