import { type Unverified } from "./unverified.js";

/**
 * A union type representing either a verified value of type `T` or an unverified value.
 * Consumers must check for `unverified` to safely access the verified value.
 * @template T - The type of the verified value.
 */
export type Maybe<T> = T | Unverified;
