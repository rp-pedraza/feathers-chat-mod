import { type User } from "@rp-pedraza/feathers-chat-mod-backend";
import createDataUri from "../utils/create-data-uri";

const getUserLocalAvatar = async (user: User): Promise<string | undefined> => {
  if (user.localAvatar) {
    const { data, mimeType } = user.localAvatar;
    return await createDataUri(data, mimeType);
  } else {
    return undefined;
  }
};

export default getUserLocalAvatar;
