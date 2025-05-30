import { Type } from "@feathersjs/typebox";

export const uint8ArrayImageSchema = Type.Unsafe<Uint8Array>({
  type: "object",
  binaryFormat: "image",
  instanceOf: "Uint8Array"
});
