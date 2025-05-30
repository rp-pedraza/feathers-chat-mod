import { Type } from "@feathersjs/typebox";

export const emailSchema = Type.String({ format: "email" });
