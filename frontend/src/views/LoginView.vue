<script setup lang="ts">
import { validateEmail, validateUsername } from "@rp-pedraza/feathers-chat-mod-backend";
import authenticate, { type Credentials } from "../authenticate";
import setupErrorHandling from "../common/setup-error-handling";
import router from "../router";

const usernameOrEmail = defineModel<string>("usernameOrEmail");
const password = defineModel<string>("password");
const { addError } = setupErrorHandling("login", { discardedErrorsSelector: "chat" });

const loginWithUsernameOrEmail = async () => {
  const ue = usernameOrEmail.value;
  const pw = password.value;
  let credentials: Credentials;

  if (!ue) {
    addError("Username or email not specified.");
    return;
  } else if (!pw) {
    addError("Password not specified.");
    return;
  } else if (validateUsername(ue)) {
    credentials = { username: ue, password: pw };
  } else if (validateEmail(ue)) {
    credentials = { email: ue, password: pw };
  } else {
    addError("Invalid username or email specified.");
    return;
  }

  try {
    await authenticate({ credentials });
  } catch (e: unknown) {
    addError(e, "Login failed: ");
    return;
  }

  router.push("/chat"); // Don't await otherwise URI won't be updated
};

const loginWithGoogle = () => {
  window.location.href = "/oauth/google";
};

const loginWithGitHub = () => {
  window.location.href = "/oauth/github";
};

const goToSignupPage = () => {
  router.push("/signup"); // Don't await otherwise URI won't be updated
};
</script>

<template>
  <div id="login" class="flex min-h-screen bg-neutral justify-center items-center">
    <div class="card w-full max-w-sm bg-base-100 px-4 py-2 my-4 shadow-xl">
      <div class="px-4">
        <h1 class="text-3xl font-bold text-center my-4 bg-clip-text bg-gradient-to-br">Login</h1>
      </div>
      <form class="card-body pt-2">
        <fieldset class="fieldset">
          <legend for="username-or-email" class="fieldset-legend">Username/Email</legend>
          <input
            type="text"
            name="username-or-email"
            placeholder="enter username or email"
            class="input input-bordered"
            v-model="usernameOrEmail"
            required
          />
        </fieldset>
        <fieldset class="fieldset mt-0">
          <legend for="password" class="fieldset-legend">Password</legend>
          <input
            type="password"
            name="password"
            placeholder="enter password"
            class="input input-bordered"
            v-model="password"
            required
          />
        </fieldset>
        <fieldset class="fieldset mt-4">
          <button id="login" type="button" class="btn" @click="loginWithUsernameOrEmail">
            Login
          </button>
        </fieldset>
        <fieldset class="fieldset">
          <button id="login-with-google" type="button" class="btn" @click="loginWithGoogle">
            Login with Google
          </button>
        </fieldset>
        <fieldset class="fieldset">
          <button id="login-with-github" type="button" class="btn" @click="loginWithGitHub">
            Login with GitHub
          </button>
        </fieldset>
        <fieldset class="fieldset">
          <button id="signup" type="button" class="btn" @click="goToSignupPage">
            Go to signup page
          </button>
        </fieldset>
      </form>
    </div>
  </div>
</template>
