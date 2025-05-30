import {
  type AuthenticationResult,
  userValidator,
  validateUsername
} from "@rp-pedraza/feathers-chat-mod-backend";
import client from "./client";
import UsernameInvalidError from "./errors/invalid-username-error";
import UsernameUnsetError from "./errors/unset-username-error";

export type LoginByEmailCredentials = {
  email: string;
  password: string;
};

export type LoginByUsernameCredentials = {
  username: string;
  password: string;
};

export type Credentials = LoginByEmailCredentials | LoginByUsernameCredentials;

export interface AuthenticationOptions {
  credentials?: Credentials;
  force?: boolean;
  requireUsername?: boolean;
}

const authenticate = async (opts?: AuthenticationOptions): Promise<AuthenticationResult> => {
  let authResult: AuthenticationResult;
  const credentials = opts?.credentials;

  if (credentials) {
    authResult = await client.authenticate({
      strategy: Object.prototype.hasOwnProperty.call(credentials, "username")
        ? "username"
        : "email",
      ...credentials
    });
  } else {
    authResult = await client.reAuthenticate(Boolean(opts?.force));
  }

  await userValidator(authResult.user);

  if (opts?.requireUsername) {
    const username = authResult.user.username;

    if (!username) {
      throw new UsernameUnsetError();
    }

    if (!validateUsername(username)) {
      throw new UsernameInvalidError();
    }
  }

  return authResult;
};

export default authenticate;
