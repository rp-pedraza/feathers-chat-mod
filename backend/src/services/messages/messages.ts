// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import { hooks as schemaHooks } from "@feathersjs/schema";
import type { Application } from "../../declarations.js";
import checkAndIncreaseVersion from "../../hooks/check-and-increase-version.js";
import logRuntime from "../../hooks/log-runtime.js";
import requireUsername from "../../hooks/require-username.js";
import { MessageService, getOptions } from "./messages.class.js";
import {
  messageDataResolver,
  messageDataValidator,
  messageExternalResolver,
  messagePatchResolver,
  messagePatchValidator,
  messageQueryResolver,
  messageQueryValidator,
  messageResolver
} from "./messages.schema.js";
import { messageMethods, messagePath } from "./messages.shared.js";

export * from "./messages.class.js";
export * from "./messages.schema.js";

// A configure function that registers the service and its hooks via `app.configure`
export const message = (app: Application) => {
  // Register our service on the Feathers application
  app.use(messagePath, new MessageService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: messageMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  });
  // Initialize hooks
  app.service(messagePath).hooks({
    around: {
      all: [
        logRuntime,
        authenticate("jwt"),
        requireUsername,
        schemaHooks.resolveExternal(messageExternalResolver),
        schemaHooks.resolveResult(messageResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(messageQueryValidator),
        schemaHooks.resolveQuery(messageQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(messageDataValidator),
        schemaHooks.resolveData(messageDataResolver)
      ],
      patch: [
        checkAndIncreaseVersion,
        schemaHooks.validateData(messagePatchValidator),
        schemaHooks.resolveData(messagePatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  });
};

// Add this service to the service type index
declare module "../../declarations.js" {
  interface ServiceTypes {
    [messagePath]: MessageService;
  }
}
