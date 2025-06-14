import type { HookContext, NextFunction } from "../declarations.js";
import { logger } from "../logger.js";

const logRuntime = async (context: HookContext, next: NextFunction) => {
  const startTime = Date.now();
  // Run everything else (other hooks and service call)
  await next();

  const duration = Date.now() - startTime;
  logger.info(`Calling ${context.method} on ${context.path} took ${duration}ms`);
};

export default logRuntime;
