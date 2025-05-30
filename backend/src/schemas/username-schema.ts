import { Type } from "@feathersjs/typebox";

export const usernameSchema = Type.String({ format: "username" });
