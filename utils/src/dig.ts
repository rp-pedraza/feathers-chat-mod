/**
 * Safely accesses nested object properties using a sequence of keys.
 * Returns the value at the specified path or undefined if any key is missing.
 *
 * @param obj - The object to traverse.
 * @param keys - The sequence of keys to access nested properties.
 * @returns The value at the specified path, or undefined if the path is invalid.
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * console.log(dig(obj, 'a', 'b', 'c')); // 42
 * console.log(dig(obj, 'a', 'x', 'c')); // undefined
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dig = (obj: any, ...keys: Array<string | number | symbol>): any => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    current = current[key];
  }
  return current ?? undefined;
};

export default dig;
