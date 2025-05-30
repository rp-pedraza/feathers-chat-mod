// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { ClientApplication } from "../../client.js";
import { UserService } from "./users.class.js";
import type { User, UserData, UserPatch, UserQuery } from "./users.schema.js";

export type { User, UserData, UserPatch, UserQuery };

export { userDataValidator, userValidator } from "./users.schema.js";

export type UserClientService = Pick<UserService, (typeof userMethods)[number]>;

export const userPath = "users";

export const userMethods = [
  "find",
  "get",
  "create",
  "patch",
  "remove",
  "getUsernameAvailability",
  "getEmailAvailability"
] as const;

export const userClient = (client: ClientApplication) => {
  const connection = client.get("connection");

  client.use(userPath, connection.service(userPath), {
    methods: userMethods
  });
};

// Add this service to the client service type index
declare module "../../client.js" {
  interface ServiceTypes {
    [userPath]: UserClientService;
  }
}
