import ValidatedLocalAvatar from "../classes/validated-local-avatar";
import type { Invalid } from "../symbols/invalid";
import type FieldStatus from "../types/field-status";

const getLocalAvatarStatus = (
  localAvatar: ValidatedLocalAvatar | Invalid | undefined
): FieldStatus => {
  if (!localAvatar) {
    return { valid: false, messages: undefined /* 'No avatar set. &#x274C;' */ };
  } else if (localAvatar instanceof ValidatedLocalAvatar) {
    return { valid: true, messages: "Image file valid. &#x2705;" };
  } else {
    return { valid: false, messages: "Image file is invalid.. &#x274C;" };
  }
};

export default getLocalAvatarStatus;
