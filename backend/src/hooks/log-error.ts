// For more information about this file see https://dove.feathersjs.com/guides/cli/log-error.html
import { hasProperty } from "@rp-pedraza/feathers-chat-mod-utils";
import type { HookContext, NextFunction } from "../declarations.js";
import { logger } from "../logger.js";

const logError = async (context: HookContext, next: NextFunction) => {
  try {
    await next();
  } catch (error: unknown) {
    if (hasProperty(error, "stack")) {
      logger.error(error.stack);
    }

    if (hasProperty(error, "data")) {
      // Log validation errors
      logger.error("Data: %O", error.data);
    }

    throw error;
  }
};

export default logError;
