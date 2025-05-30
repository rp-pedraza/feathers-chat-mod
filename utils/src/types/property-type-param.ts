import type { Constructor } from "./constructor.js";
import type { TypeMap } from "./type-map.js";

/**
 * Type of the `type` parameter in property-checking functions like
 * `hasProperty` and `hasOwnProperty`.
 *
 * Can be a primitive type key (e.g., "string"), a constructor (e.g., Date), or
 * "unknown" to allow any value.
 */
export type PropertyTypeParam = keyof TypeMap | Constructor | "unknown";
