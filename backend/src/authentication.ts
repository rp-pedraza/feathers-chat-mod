import {
  AuthenticationRequest,
  AuthenticationService,
  JWTStrategy
} from "@feathersjs/authentication";
import { LocalStrategy } from "@feathersjs/authentication-local";
import type { OAuthProfile } from "@feathersjs/authentication-oauth";
import { oauth, OAuthStrategy } from "@feathersjs/authentication-oauth";
import type { Params } from "@feathersjs/feathers";
import { find, omitBy, uniq } from "lodash-es";
import fetch from "node-fetch";
import type { Application } from "./declarations.js";
import {
  GithubListEmailAddressesForTheAuthenticatedUserResponse,
  githubListEmailAddressesForTheAuthenticatedUserResponseSchema
} from "./schemas/github-list-email-addresses-for-the-authenticated-user-response-schema.js";
import { dataValidator, validateUsername } from "./validators.js";

declare module "./declarations.js" {
  interface ServiceTypes {
    authentication: AuthenticationService;
  }
}

const createUsernameSuggestions = (
  existingSuggestions: string | null,
  ...samples: Array<string | null | undefined>
): string | null => {
  const suggestions = [...(existingSuggestions ?? "").split(","), ...samples]
    .map((e) => (e ?? "").replace(/@.*/, ""))
    .filter((e) => validateUsername(e));

  return suggestions.length ? uniq(suggestions).join(",") : null;
};

class GoogleStrategy extends OAuthStrategy {
  async findEntityByEmail(email: string, params: Params) {
    const query = { email };
    const result = await this.entityService.find({ ...params, query });
    const [entity = undefined] = result.data ? result.data : result;
    return entity as Record<string, unknown>;
  }

  async findEntity(profile: OAuthProfile, params: Params) {
    const entityByGoogleId = await super.findEntity(profile, params);

    if (entityByGoogleId) {
      return entityByGoogleId;
    }

    const entityByEmail = await this.findEntityByEmail(profile.email, params);

    // Associate Google account to entity with the same email and no other
    // google account associated to it.
    if (entityByEmail?.googleId ?? false) {
      return entityByEmail;
    }

    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getEntityData(profile: OAuthProfile, existing: any, params: Params) {
    const baseData = await super.getEntityData(profile, existing, params);

    const entityData = {
      ...baseData,
      email: existing?.email ?? profile.email, // Don't override existing email
      googleAvatar: profile.picture,
      usernameSuggestions: createUsernameSuggestions(existing?.usernameSuggestions, profile.email)
    };

    return omitBy(entityData, (v) => v == null);
  }
}

class GitHubStrategy extends OAuthStrategy {
  // Fetch private emails
  // Credits to: https://github.com/feathersjs/feathers/issues/2024#issuecomment-1696099027
  async getProfile(data: AuthenticationRequest, params: Params) {
    const accessToken = data.access_token;
    const baseProfile = await super.getProfile(data, params);
    const profile = { ...baseProfile };

    if (accessToken) {
      try {
        // https://docs.github.com/en/rest/users/emails?apiVersion=2022-11-28#list-email-addresses-for-the-authenticated-user
        const response = await fetch("https://api.github.com/user/emails", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-GitHub-Api-Version": "2022-11-28"
          }
        });

        const data = await response.json();

        if (
          dataValidator.validate(
            githubListEmailAddressesForTheAuthenticatedUserResponseSchema,
            data
          )
        ) {
          const primaryEmail = find(
            data as GithubListEmailAddressesForTheAuthenticatedUserResponse,
            {
              primary: true,
              verified: true
            }
          )?.email;

          if (primaryEmail) {
            Object.assign(profile, { email: primaryEmail });
          } else {
            console.error("No verified primary email found.");
          }
        } else {
          console.error("Invalid response data from 'https://api.github.com/user/emails':", data);
        }
      } catch (e: unknown) {
        console.error("Failed to get primary email:", e);
      }
    }

    return profile;
  }

  async getEntityData(profile: OAuthProfile, existing: Record<string, unknown>, params: Params) {
    const baseData = await super.getEntityData(profile, existing, params);
    const usernameSuggestions = (existing?.usernameSuggestions ?? null) as string | null;

    const entityData = {
      ...baseData,
      githubAvatar: profile.avatar_url,
      email: existing?.email ?? profile.email, // Don't override existing email
      usernameSuggestions: createUsernameSuggestions(
        usernameSuggestions,
        profile.login,
        profile.email
      )
    };

    return omitBy(entityData, (v) => v == null);
  }
}

export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app);

  authentication.register("jwt", new JWTStrategy());
  authentication.register("email", new LocalStrategy());
  authentication.register("username", new LocalStrategy());
  authentication.register("google", new GoogleStrategy());
  authentication.register("github", new GitHubStrategy());

  app.use("authentication", authentication);
  app.configure(oauth());
};
