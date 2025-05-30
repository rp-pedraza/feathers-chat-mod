import type FieldStatus from "../types/field-status";
import isNotNullOrUndefined from "../utils/is-not-null-or-undefined";

const getFieldStatusMessages = (status: FieldStatus | null | undefined) => {
  return [status?.messages].flat().filter(isNotNullOrUndefined);
};

export default getFieldStatusMessages;
