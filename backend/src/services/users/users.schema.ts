// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { passwordHash } from "@feathersjs/authentication-local";
import { resolve, virtual } from "@feathersjs/schema";
import type { Static } from "@feathersjs/typebox";
import { getValidator, querySyntax, Type } from "@feathersjs/typebox";
import { dig } from "@rp-pedraza/feathers-chat-mod-utils";
import type { HookContext } from "../../declarations.js";
import { Nullable } from "../../nullable.js";
import { dataValidator, queryValidator } from "../../validators.js";
import { localAvatarSchema } from "../local-avatars/local-avatars.schema.js";

// Main data model schema
export const userSchema = Type.Object(
  {
    id: Type.Number(),
    username: Type.Optional(Nullable(Type.String({ format: "username" }))),
    email: Type.Optional(Nullable(Type.String({ format: "email" }))),
    password: Type.Optional(Nullable(Type.String())),
    githubId: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Null()])),
    googleId: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Null()])),
    githubAvatar: Type.Optional(Nullable(Type.String())),
    googleAvatar: Type.Optional(Nullable(Type.String())),
    usernameSuggestions: Type.Optional(Nullable(Type.String())),
    preferredAvatar: Type.Optional(Nullable(Type.String())),
    version: Type.Number(),
    localAvatar: Type.Optional(Type.Ref(localAvatarSchema))
  },
  { $id: "User", additionalProperties: false }
);
export type User = Static<typeof userSchema>;
export const userValidator = getValidator<unknown, User>(userSchema, dataValidator);
export const userResolver = resolve<User, HookContext>({
  localAvatar: virtual(async (user, context) => {
    const query = { userId: user.id };
    const [avatar = undefined] = (await context.app.service("local-avatars").find({ query })).data;
    return avatar;
  })
});
export const userExternalResolver = resolve<User, HookContext>({
  // The password should never be visible externally

  password: async () => undefined
});

// Password hasher

const hasher = passwordHash({ strategy: "local" });

// Schema for creating new users
export const userDataSchema = Type.Pick(
  userSchema,
  [
    "username",
    "email",
    "password",
    "githubId",
    "googleId",
    "githubAvatar",
    "googleAvatar",
    "usernameSuggestions",
    "preferredAvatar"
  ],
  {
    $id: "UserData",
    additionalProperties: false
  }
);
export type UserData = Static<typeof userDataSchema>;
export const userDataValidator = getValidator<unknown, UserData>(
  userDataSchema,
  dataValidator
);
export const userDataResolver = resolve<User, HookContext>({
  password(value: string | null | undefined, _data: unknown, context: HookContext) {
    return hasher(value ?? undefined, _data, context);
  }
});

// Schema for updating existing users
export const userPatchSchema = Type.Partial(userSchema, {
  $id: "UserPatch"
});
export type UserPatch = Static<typeof userPatchSchema>;
export const userPatchValidator = getValidator<unknown, UserPatch>(
  userPatchSchema,
  dataValidator
);
export const userPatchResolver = resolve<User, HookContext>({
  password(value: string | null | undefined, _data: unknown, context: HookContext) {
    return hasher(value ?? undefined, _data, context);
  }
});

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, [
  "id",
  "username",
  "email",
  "githubId",
  "googleId"
]);
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { $id: "UserQuery", additionalProperties: false }
);
export type UserQuery = Static<typeof userQuerySchema>;
export const userQueryValidator = getValidator<unknown, UserQuery>(userQuerySchema, queryValidator);

export const userQueryResolver = resolve<UserQuery, HookContext>({
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  id: (value, _user, context) => {
    // We want to be able to get a list of all users but
    // only let a user modify their own data otherwise
    if (context.method !== "find") {
      const newValue = dig(context.params, "user", "id") as unknown;

      if (typeof newValue === "number") {
        return newValue;
      }
    }

    return value;
  }
});

// Schema for querying availability of a username
export const userUsernameAvailabilityQuerySchema = Type.Pick(userSchema, ["username"], {
  $id: "UserUsernameAvailabilityQuery",
  additionalProperties: false
});
export type UserUsernameAvailabilityQuery = Static<typeof userUsernameAvailabilityQuerySchema>;
export const userUsernameAvailabilityQueryValidator = getValidator(
  userUsernameAvailabilityQuerySchema,
  dataValidator
);

// Schema for responding to a username availability query
export const userUsernameAvailabilityResponseSchema = Type.Pick(userSchema, ["username"], {
  $id: "UserUsernameAvailabilityResponse",
  additionalProperties: false
});
export type UserUsernameAvailabilityResponse = Static<
  typeof userUsernameAvailabilityResponseSchema
>;
export const userUsernameAvailabilityResponseValidator = getValidator(
  userUsernameAvailabilityResponseSchema,
  dataValidator
);
