import { authenticate } from "@feathersjs/authentication";
import { hooks as schemaHooks } from "@feathersjs/schema";
import type { Application, HookContext } from "../../declarations.js";
import checkAndIncreaseVersion from "../../hooks/check-and-increase-version.js";
import { UserService, getOptions } from "./users.class.js";
import {
  userDataResolver,
  userDataValidator,
  userExternalResolver,
  userPatchResolver,
  userPatchValidator,
  userQueryResolver,
  userQueryValidator,
  userResolver,
  userValidator
} from "./users.schema.js";
import { userMethods, userPath } from "./users.shared.js";

export * from "./users.class.js";
export * from "./users.schema.js";

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app: Application) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  });
  // Initialize hooks
  app.service(userPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(userExternalResolver),
        schemaHooks.resolveResult(userResolver)
      ],
      find: [authenticate("jwt")],
      get: [authenticate("jwt")],
      create: [],
      update: [authenticate("jwt")],
      patch: [authenticate("jwt")],
      remove: [authenticate("jwt")]
    },
    before: {
      all: [
        schemaHooks.validateQuery(userQueryValidator),
        schemaHooks.resolveQuery(userQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(userDataValidator),
        schemaHooks.resolveData(userDataResolver)
      ],
      patch: [
        checkAndIncreaseVersion,
        schemaHooks.validateData(userPatchValidator),
        schemaHooks.resolveData(userPatchResolver)
      ],
      remove: []
    },
    after: {
      all: [],
      get: [
        async (context: HookContext) => {
          console.log("context.result", context.result);
          try {
            userValidator(context.result);
          } catch (e: unknown) {
            console.error(e);
          }
        }
      ]
    },
    error: {
      all: []
    }
  });
};

// Add this service to the service type index
declare module "../../declarations.js" {
  interface ServiceTypes {
    [userPath]: UserService;
  }
}
