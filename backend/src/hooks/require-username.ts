import type { HookContext, NextFunction } from "../declarations.js";
import { validateUsername } from "../validators.js";

const requireUsername = async (context: HookContext, next: NextFunction) => {
  if (context.params.user) {
    const username = context.params.user.username;

    if (!username) {
      throw new Error("User is required to have a username.");
    }

    if (!validateUsername(username)) {
      throw new Error("Current username is invalid.");
    }
  }

  await next();
};

export default requireUsername;
