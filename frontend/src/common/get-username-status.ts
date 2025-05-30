import { validateUsername, type User } from "@rp-pedraza/feathers-chat-mod-backend";
import type FieldStatus from "../types/field-status";
import { TextDecoration } from "../types/text-decoration";
import usernameAvailable from "./username-available";

const getUsernameStatus = async (
  username: string | undefined,
  currentUser: User | null,
  onError: (error: unknown) => void
): Promise<FieldStatus> => {
  const { Ballot, CheckMark } = TextDecoration;

  try {
    if (currentUser?.username && username === currentUser.username) {
      return { valid: null, messages: null };
    } else if (!username || !validateUsername(username)) {
      return { valid: false, messages: { message: "Username is invalid.", decoration: Ballot } };
    } else if (!(await usernameAvailable(username as string))) {
      return {
        valid: false,
        messages: { message: "Username is not available.", decoration: Ballot }
      };
    } else {
      return { valid: true, messages: { message: "Username is available", decoration: CheckMark } };
    }
  } catch (error: unknown) {
    onError(error);
    return { valid: false, messages: { message: "Username status unknown.", decoration: Ballot } };
  }
};

export default getUsernameStatus;
