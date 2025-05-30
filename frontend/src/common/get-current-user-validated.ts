import { type User, userValidator } from "@rp-pedraza/feathers-chat-mod-backend";
import InvalidUserError from "../errors/invalid-user-error";
import getErrorMessage from "../utils/get-error-message";
import getCurrentUser from "./get-current-user";

const getCurrentUserValidated = async (): Promise<User> => {
  const user = await getCurrentUser();

  try {
    return userValidator(user);
  } catch (error: unknown) {
    throw new InvalidUserError(getErrorMessage(error));
  }
};

export default getCurrentUserValidated;
