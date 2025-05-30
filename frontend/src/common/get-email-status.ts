import { validateEmail } from "@rp-pedraza/feathers-chat-mod-backend";
import type FieldStatus from "../types/field-status";
import emailAvailable from "./email-available";

const getEmailStatus = async (
  email: string | undefined,
  onError: (error: unknown) => void
): Promise<FieldStatus> => {
  try {
    if (!email || !validateEmail(email)) {
      return { valid: false, messages: "Email is invalid. &#x274C;" };
    } else if (!(await emailAvailable(email as string))) {
      return { valid: false, messages: "Email is aleady in use. &#x274C;" };
    } else {
      return { valid: true, messages: "Email is valid. &#x2705;" };
    }
  } catch (error: unknown) {
    onError(error);
    return { valid: false, messages: "Email status unknown. &#x274C;" };
  }
};

export default getEmailStatus;
