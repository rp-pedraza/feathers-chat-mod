import type { Constructor, PropertyTypeParam, TypeMap } from "./types/index.js";

/**
 * Checks if an object has a property, optionally verifying its type
 * @param object The object to check
 * @param property The property name to look for
 * @param type Optional type to verify (e.g., "string", Date, or "unknown").
 *   If omitted, the property's value is treated as `unknown`.
 * @returns `true` if the property exists and matches the specified type (if provided).
 */
function hasProperty(
  object: unknown,
  property: string
): object is { [key in typeof property]: unknown };
function hasProperty<T extends PropertyTypeParam>(
  object: unknown,
  property: string,
  type: T
): object is {
  [key in typeof property]: T extends keyof TypeMap
    ? TypeMap[T]
    : T extends Constructor<infer U>
      ? U
      : unknown;
};
function hasProperty(
  object: unknown,
  property: string,
  type?: never
): object is { [key in typeof property]: unknown } {
  return (
    typeof object === "object" &&
    object !== null &&
    property in object &&
    (type === undefined ||
      type === "unknown" ||
      (typeof type === "string"
        ? typeof (object as Record<string, unknown>)[property] === type
        : typeof type === "function" &&
          (object as Record<string, unknown>)[property] != null &&
          (object as Record<string, unknown>)[property] instanceof type))
  );
}

export default hasProperty;
