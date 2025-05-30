import { authenticate } from "@feathersjs/authentication";
import { hooks as schemaHooks } from "@feathersjs/schema";
import type { Application } from "../../declarations.js";
import checkAndIncreaseVersion from "../../hooks/check-and-increase-version.js";
import logRuntime from "../../hooks/log-runtime.js";
import { LocalAvatarService, getOptions } from "./local-avatars.class.js";
import {
  localAvatarDataResolver,
  localAvatarDataValidator,
  localAvatarExternalResolver,
  localAvatarMimeTypeValidator,
  localAvatarPatchResolver,
  localAvatarPatchValidator,
  localAvatarQueryResolver,
  localAvatarQueryValidator,
  localAvatarResolver
} from "./local-avatars.schema.js";
import { localAvatarMethods, localAvatarPath } from "./local-avatars.shared.js";

export * from "./local-avatars.class.js";
export * from "./local-avatars.schema.js";

export const localAvatar = (app: Application) => {
  app.use(localAvatarPath, new LocalAvatarService(getOptions(app)), {
    methods: localAvatarMethods,
    events: []
  });

  app.service(localAvatarPath).hooks({
    around: {
      all: [
        logRuntime,
        authenticate("jwt"),
        schemaHooks.resolveExternal(localAvatarExternalResolver),
        schemaHooks.resolveResult(localAvatarResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(localAvatarQueryValidator),
        schemaHooks.resolveQuery(localAvatarQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(localAvatarDataValidator),
        schemaHooks.resolveData(localAvatarDataResolver),
        localAvatarMimeTypeValidator
      ],
      patch: [
        checkAndIncreaseVersion,
        schemaHooks.validateData(localAvatarPatchValidator),
        schemaHooks.resolveData(localAvatarPatchResolver),
        localAvatarMimeTypeValidator
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

declare module "../../declarations.js" {
  interface ServiceTypes {
    [localAvatarPath]: LocalAvatarService;
  }
}
