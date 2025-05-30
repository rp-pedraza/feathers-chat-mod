import type { ClientApplication } from "../../client.js";
import { LocalAvatarService } from "./local-avatars.class.js";
import type {
  LocalAvatar,
  LocalAvatarData,
  LocalAvatarPatch,
  LocalAvatarQuery
} from "./local-avatars.schema.js";

export type { LocalAvatar, LocalAvatarData, LocalAvatarPatch, LocalAvatarQuery };

export {
  localAvatarDataValidator,
  localAvatarValidator,
  localAvatarValidatorExtended
} from "./local-avatars.schema.js";

export type LocalAvatarClientService = Pick<
  LocalAvatarService,
  (typeof localAvatarMethods)[number]
>;

export const localAvatarPath = "local-avatars";

export const localAvatarMethods = ["find", "get", "create", "patch", "remove"] as const;

export const localAvatarClient = (client: ClientApplication) => {
  const connection = client.get("connection");
  client.use(localAvatarPath, connection.service(localAvatarPath), {
    methods: localAvatarMethods
  });
};

declare module "../../client.js" {
  interface ServiceTypes {
    [localAvatarPath]: LocalAvatarClientService;
  }
}
