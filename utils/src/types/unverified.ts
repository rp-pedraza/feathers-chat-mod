/**
 * The type of the `unverified` symbol, used to indicate an unverified value.
 * Values of this type must be checked explicitly (e.g., using `=== unverified`) to narrow the type.
 */
export type Unverified = { __unverified: true };
