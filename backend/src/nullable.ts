import { TSchema, Type } from "@feathersjs/typebox";

export const Nullable = <T extends TSchema>(T: T) => {
  return Type.Union([T, Type.Null()]);
};
