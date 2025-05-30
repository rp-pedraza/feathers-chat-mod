import { Static, Type } from "@sinclair/typebox";

export const githubListEmailAddressesForTheAuthenticatedUserResponseSchema = Type.Array(
  Type.Object(
    {
      email: Type.String({ format: "email", examples: ["octocat@github.com"] }),
      primary: Type.Boolean({ examples: [true] }),
      verified: Type.Boolean({ examples: [true] }),
      visibility: Type.Union([
        Type.String({ examples: ["public"] }),
        Type.Null({ examples: ["public"] })
      ])
    },
    { additionalProperties: false, description: "Email" }
  ),
  { $id: "GithubListEmailAddressesForTheAuthenticatedUserResponse" }
);

export type GithubListEmailAddressesForTheAuthenticatedUserResponse = Static<
  typeof githubListEmailAddressesForTheAuthenticatedUserResponseSchema
>;
