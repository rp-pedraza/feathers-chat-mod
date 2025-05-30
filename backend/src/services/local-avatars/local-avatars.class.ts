import type { KnexAdapterOptions, KnexAdapterParams } from "@feathersjs/knex";
import { KnexService } from "@feathersjs/knex";
import type { Application } from "../../declarations.js";
import type {
  LocalAvatar,
  LocalAvatarData,
  LocalAvatarPatch,
  LocalAvatarQuery
} from "./local-avatars.schema.js";

export type LocalAvatarParams = KnexAdapterParams<LocalAvatarQuery>;

export class LocalAvatarService extends KnexService<
  LocalAvatar,
  LocalAvatarData,
  LocalAvatarParams,
  LocalAvatarPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("sqliteClient"),
    name: "local_avatars"
  };
};
