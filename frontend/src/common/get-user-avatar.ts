import { type User } from "@rp-pedraza/feathers-chat-mod-backend";
import getGravatarUri from "../utils/get-gravatar-uri";
import getPreferredUserAvatar from "./get-preferred-user-avatar";
import getUserLocalAvatar from "./get-user-local-avatar";

const getUserAvatar = async (
  user: User,
  autoGenerateGravatar?: boolean
): Promise<string | undefined> => {
  return (
    (await getPreferredUserAvatar(user)) ??
    (await getUserLocalAvatar(user)) ??
    user.githubAvatar ??
    user.googleAvatar ??
    (autoGenerateGravatar ? getGravatarUri(user.email) : undefined)
  );
};

export default getUserAvatar;
