import client from "../client";

const usernameAvailable = async (username: string): Promise<boolean> => {
  const query = { username };
  const availability = await client.service("users").getUsernameAvailability({}, { query });

  if (availability.username !== username) {
    throw new Error("Invalid response from server: usernames don't match.");
  }

  return availability.available;
};

export default usernameAvailable;
