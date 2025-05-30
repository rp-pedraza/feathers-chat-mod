import type { ClientApplication } from "../../client.js";
import { MessageService } from "./messages.class.js";
import type { Message, MessageData, MessagePatch, MessageQuery } from "./messages.schema.js";

export type { Message, MessageData, MessagePatch, MessageQuery };

export { messageDataValidator, messageValidator } from "./messages.schema.js";

export type MessageClientService = Pick<MessageService, (typeof messageMethods)[number]>;

export const messagePath = "messages";

export const messageMethods = ["find", "get", "create", "patch", "remove"] as const;

export const messageClient = (client: ClientApplication) => {
  const connection = client.get("connection");

  client.use(messagePath, connection.service(messagePath), {
    methods: messageMethods
  });
};

// Add this service to the client service type index
declare module "../../client.js" {
  interface ServiceTypes {
    [messagePath]: MessageClientService;
  }
}
