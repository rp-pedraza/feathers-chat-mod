import type { User } from "@rp-pedraza/feathers-chat-mod-backend";
import client from "../client";

const getCurrentUser = async (): Promise<User | null> => {
  const auth = await client.get("authentication");
  return auth?.user ?? null;
};

export default getCurrentUser;
