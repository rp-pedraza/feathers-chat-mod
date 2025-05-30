import type { KnexAdapterOptions, KnexAdapterParams } from "@feathersjs/knex";
import { KnexService } from "@feathersjs/knex";
import type { Application } from "../../declarations.js";
import type { Message, MessageData, MessagePatch, MessageQuery } from "./messages.schema.js";

export type MessageParams = KnexAdapterParams<MessageQuery>;

export class MessageService extends KnexService<
  Message,
  MessageData,
  MessageParams,
  MessagePatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("sqliteClient"),
    name: "messages"
  };
};
