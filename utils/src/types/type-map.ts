/**
 * Maps JavaScript type names to their corresponding types.
 * Used for type checking in property-related utilities.
 */
export interface TypeMap {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  symbol: symbol;
  undefined: undefined;
  object: object;
  function: (...args: unknown[]) => unknown;
}
