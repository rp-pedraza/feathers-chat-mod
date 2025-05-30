import type { AuthenticationResult } from "@feathersjs/authentication";
import authenticationClient, {
  type AuthenticationClientOptions
} from "@feathersjs/authentication-client";
import type { Application, TransportConnection } from "@feathersjs/feathers";
import { feathers } from "@feathersjs/feathers";
import { localAvatarClient } from "./services/local-avatars/local-avatars.shared.js";
import { messageClient } from "./services/messages/messages.shared.js";
import { userClient } from "./services/users/users.shared.js";

export type { AuthenticationResult } from "@feathersjs/authentication";
export { NotAuthenticated } from "@feathersjs/errors";
export type { FeathersService, Paginated } from "@feathersjs/feathers";
export * from "@feathersjs/socketio-client";

export { ALLOWED_IMAGE_MIME_TYPES, UPLOADED_AVATAR_MAXIMUM_SIZE } from "./constants.js";

export { getMimeType } from "./get-mime-type.js";

export {
  localAvatarDataValidator,
  localAvatarValidator,
  localAvatarValidatorExtended,
  type LocalAvatar,
  type LocalAvatarData,
  type LocalAvatarPatch,
  type LocalAvatarQuery
} from "./services/local-avatars/local-avatars.shared.js";

export {
  messageDataValidator,
  messageValidator,
  type Message,
  type MessageData,
  type MessagePatch,
  type MessageQuery
} from "./services/messages/messages.shared.js";

export {
  userDataValidator,
  userValidator,
  type User,
  type UserData,
  type UserPatch,
  type UserQuery
} from "./services/users/users.shared.js";

export {
  ajvFormats,
  validateEmail,
  validateImageMimeType,
  validateUint8ArrayImage,
  validateUsername
} from "./validators.js";

export interface Configuration {
  connection: TransportConnection<ServiceTypes>;
  authentication: Promise<AuthenticationResult> | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>;

export { type HookContext } from "./declarations.js";

/**
 * Returns a typed client for the feathers-chat app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = (
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
): ClientApplication => {
  const client = feathers<ServiceTypes, Configuration>();
  client.configure(connection);
  client.configure(authenticationClient(authenticationOptions));
  client.set("connection", connection);
  client.configure(userClient);
  client.configure(messageClient);
  client.configure(localAvatarClient);
  return client;
};
