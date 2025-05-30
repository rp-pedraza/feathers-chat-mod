import { resolve, virtual } from "@feathersjs/schema";
import type { Static } from "@feathersjs/typebox";
import { getValidator, querySyntax, Type } from "@feathersjs/typebox";
import type { HookContext } from "../../declarations.js";
import { dataValidator, queryValidator } from "../../validators.js";
import { userSchema } from "../users/users.schema.js";

// Main data model schema
export const messageSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String(),
    createdAt: Type.Number(),
    userId: Type.Number(),
    version: Type.Number(),
    user: Type.Ref(userSchema)
  },
  { $id: "Message", additionalProperties: false }
);
export type Message = Static<typeof messageSchema>;
export const messageValidator = getValidator<unknown, Message>(messageSchema, dataValidator);
export const messageResolver = resolve<Message, HookContext>({
  user: virtual(async (message, context) => {
    // Associate the user that sent the message
    return context.app.service("users").get(message.userId);
  })
});
export const messageExternalResolver = resolve<Message, HookContext>({});

// Schema for creating new entries
export const messageDataSchema = Type.Pick(messageSchema, ["text"], {
  $id: "MessageData"
});
export type MessageData = Static<typeof messageDataSchema>;
export const messageDataValidator = getValidator<unknown, MessageData>(
  messageDataSchema,
  dataValidator
);
export const messageDataResolver = resolve<Message, HookContext>({
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user.id;
  },
  createdAt: async () => {
    return Date.now();
  }
});

// Schema for updating existing entries
export const messagePatchSchema = Type.Pick(messageSchema, ["id", "text", "version"], {
  $id: "MessagePatch"
});
export type MessagePatch = Static<typeof messagePatchSchema>;
export const messagePatchValidator = getValidator<unknown, MessagePatch>(
  messagePatchSchema,
  dataValidator
);
export const messagePatchResolver = resolve<Message, HookContext>({});

// Schema for allowed query properties
export const messageQueryProperties = Type.Pick(messageSchema, [
  "id",
  "text",
  "createdAt",
  "userId"
]);
export const messageQuerySchema = Type.Intersect(
  [
    querySyntax(messageQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { $id: "MessageQuery", additionalProperties: false }
);
export type MessageQuery = Static<typeof messageQuerySchema>;
export const messageQueryValidator = getValidator<unknown, MessageQuery>(
  messageQuerySchema,
  queryValidator
);
export const messageQueryResolver = resolve<MessageQuery, HookContext>({
  userId: async (value, _user, context) => {
    // We want to be able to find all messages but
    // only let a user modify their own messages otherwise
    if (context.params.user && context.method !== "find") {
      return context.params.user.id;
    }

    return value;
  }
});
