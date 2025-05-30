import type FieldStatus from "../types/field-status";

const getPasswordStatus = (
  password: string | undefined,
  passwordVerification: string | undefined
): FieldStatus => {
  if (!password) {
    return { valid: false, messages: "No password entered. &#x274C;" };
  } else if (password !== passwordVerification) {
    return { valid: false, messages: "Passwords don't match. &#x274C;" };
  } else {
    return { valid: false, messages: "Passwords match. &#x2705;" };
  }
};

export default getPasswordStatus;
