import client from "../client";
import router from "../router";

const logout = async () => {
  await client.logout();
  router.push("/login"); // Don't await otherwise URI won't be updated
};

export default logout;
