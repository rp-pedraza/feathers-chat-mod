import { type User } from "@rp-pedraza/feathers-chat-mod-backend";
import { displayErrorMessage } from "../toast";
import getGravatarUri from "../utils/get-gravatar-uri";
import testDataUriInImage from "../utils/test-data-uri-in-image";
import getUserLocalAvatar from "./get-user-local-avatar";

const getPreferredUserAvatar = async (user: User): Promise<string | undefined> => {
  let uri: string | undefined;

  switch (user.preferredAvatar) {
    case "local":
      uri = await getUserLocalAvatar(user);
      break;
    case "github":
      console.debug("Using github as preferred avatar");
      uri = user.githubAvatar ?? undefined;
      break;
    case "google":
      uri = user.googleAvatar ?? undefined;
      break;
    case "gravatar":
      uri = getGravatarUri(user.email);
  }

  console.debug("uri", uri);

  if (uri) {
    const uriValid = await testDataUriInImage(uri);

    if (uriValid) {
      console.debug("Valid image data URI");
      return uri;
    } else if (user.preferredAvatar === "local") {
      displayErrorMessage("Invalid local avatar image data");
    } else {
      displayErrorMessage("Invalid image data URI");
    }
  }

  return undefined;
};

export default getPreferredUserAvatar;
