import type { Application } from "../declarations.js";
import { localAvatar } from "./local-avatars/local-avatars.js";
import { message } from "./messages/messages.js";
import { user } from "./users/users.js";

export const services = (app: Application) => {
  app.configure(message);
  app.configure(user);
  app.configure(localAvatar);
};
