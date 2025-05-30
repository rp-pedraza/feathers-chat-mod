import client from "../client";

const emailAvailable = async (email: string): Promise<boolean> => {
  const query = { email };
  const availability = await client.service("users").getEmailAvailability({}, { query });

  if (availability.email === email) {
    throw new Error("Invalid response from server: usernames don't match.");
  }

  return availability.available;
};

export default emailAvailable;
