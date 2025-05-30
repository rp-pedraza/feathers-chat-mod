import { NotAuthenticated } from "@rp-pedraza/feathers-chat-mod-backend";
import { createRouter, createWebHistory } from "vue-router";
import authenticate from "./authenticate";
import client from "./client";
import UsernameInvalidError from "./errors/invalid-username-error";
import UsernameUnsetError from "./errors/unset-username-error";
import { useErrorsStore } from "./stores/errors";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: { name: "chat", hash: "" }
    },
    {
      path: "/avatar",
      name: "avatar",
      redirect: { name: "avatars", hash: "" }
    },
    {
      path: "/avatars",
      name: "avatars",
      component: import("./views/AvatarsView.vue")
    },
    {
      path: "/chat",
      name: "chat",
      component: import("./views/ChatView.vue")
    },
    {
      path: "/login",
      name: "login",
      component: import("./views/LoginView.vue")
    },
    {
      path: "/logout",
      name: "logout",
      component: import("./views/LogoutView.vue")
    },
    {
      path: "/signup",
      name: "signup",
      component: import("./views/SignupView.vue")
    },
    {
      path: "/username",
      name: "username",
      component: import("./views/UsernameView.vue")
    },
    {
      path: "/:pathMatch(.*)*",
      component: import("./views/PageNotFoundView.vue")
    }
  ]
});

router.beforeEach(async (to) => {
  if (to.name !== "login" && to.name !== "logout" && to.name !== "signup" && to.name != "test") {
    try {
      await authenticate({ requireUsername: to.name !== "username" });
    } catch (e: unknown) {
      if (e instanceof NotAuthenticated) {
        console.debug("Not authenticated");
        return { name: "login" };
      } else if (e instanceof UsernameInvalidError || e instanceof UsernameUnsetError) {
        console.debug("Username invalid or unset");
        return { name: "username" };
      } else {
        console.error(e);
        const errors = useErrorsStore();
        errors.add(e, { prefix: "Authentication error: ", domain: "router" });
        await client.logout(); // Invalidate token so error doesn't persist
        return { name: "login" };
      }
    }

    if (to.hash) {
      return { ...to, hash: "" };
    }
  }
});

export default router;
