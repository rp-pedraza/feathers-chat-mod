<script setup lang="ts">
import { userDataValidator } from "@rp-pedraza/feathers-chat-mod-backend";
import { computed, ref, watch } from "vue";
import authenticate, { type Credentials } from "../authenticate";
import client from "../client";
import getCurrentUserValidated from "../common/get-current-user-validated";
import getEmailStatus from "../common/get-email-status";
import getPasswordStatus from "../common/get-password-status";
import getUsernameStatus from "../common/get-username-status";
import setupErrorHandling from "../common/setup-error-handling";
import router from "../router";
import { displaySuccessMessage } from "../toast";
import type FieldStatus from "../types/field-status";
import type { FieldValidator } from "../types/field-validator";
import watchDebounced from "../utils/watch-debounced";

const username = ref<string>("username");
const email = ref<string>("email");
const password = ref<string>("password");
const passwordVerification = ref<string>("passwordVerification");
const usernameStatus = ref<FieldStatus>({});
const emailStatus = ref<FieldStatus>({});
const passwordStatus = ref<FieldStatus>({});

const { addError } = setupErrorHandling("signup");

const signup = async () => {
  if (!username.value) {
    addError("Username needs to be specified");
  } else if (!email.value) {
    addError("Email address needs to be specified");
  } else if (!password.value) {
    addError("Password needs to be specified");
  } else {
    const credentials: Credentials = {
      username: username.value,
      email: email.value,
      password: password.value
    };
    console.debug("credentials", credentials);

    try {
      await userDataValidator(credentials);
    } catch (e: unknown) {
      addError(e, "Invalid credentials: ");
    }

    try {
      await client.service("users").create(credentials);
    } catch (e: unknown) {
      addError(e, "Failed to create user: ");
    }

    displaySuccessMessage("User created successfully");

    try {
      await authenticate({ credentials });
    } catch (e: unknown) {
      addError(e, "Failed to login using just-created credentials: ");
      return;
    }

    router.push("/chat"); // Don't await otherwise URI won't be updated
  }
};

const signupWithGoogle = () => {
  window.location.href = "/oauth/google";
};

const signupWithGitHub = () => {
  window.location.href = "/oauth/github";
};

const goToLoginPage = () => {
  router.push("/login"); // Don't await otherwise URI won't be updated
};

watchDebounced(username, async (newUsername) => {
  usernameStatus.value = await getUsernameStatus(
    newUsername,
    await getCurrentUserValidated(),
    addError
  );
});

watchDebounced(email, async (newEmail) => {
  emailStatus.value = await getEmailStatus(newEmail, addError);
});

watch([password, passwordVerification], () => {
  passwordStatus.value = getPasswordStatus(password.value, passwordVerification.value);
});

const disableSignUpButton = computed(
  () => !password.value || password.value != passwordVerification.value
);

const validateUsernameField: FieldValidator = async (username: string | undefined) => {
  return await getUsernameStatus(username, null, addError);
};

const validateEmailField: FieldValidator = async (email: string | undefined) => {
  return await getEmailStatus(email, addError);
};
</script>

<template>
  <div id="signup" class="flex min-h-screen bg-neutral justify-center items-center">
    <div class="card w-full max-w-sm bg-base-100 px-4 py-2 my-4 shadow-xl">
      <div class="px-4">
        <h1 class="text-3xl font-bold text-center my-4 bg-clip-text bg-gradient-to-br">Sign Up</h1>
      </div>
      <form class="card-body pt-2">
        <InputField
          type="text"
          name="username"
          placeholder="enter username"
          label="Username"
          required="true"
          v-model:value="username"
          v-model:status="usernameStatus"
          :validator="validateUsernameField"
        />
        <InputField
          type="text"
          name="email"
          placeholder="enter email"
          label="Email"
          required="true"
          v-model:value="email"
          v-model:status="emailStatus"
          :validator="validateEmailField"
        />
        <InputField
          type="password"
          name="password"
          placeholder="enter password"
          label="Password"
          required="true"
          v-model:value="password"
        />
        <InputField
          type="password"
          name="verify-password"
          placeholder="verify password"
          label="Verify Password"
          required="true"
          v-model:value="passwordVerification"
          v-mmodel:status="passwordStatus"
        />
        <fieldset class="fieldset mt-3">
          <button
            id="signup"
            type="button"
            class="btn"
            @click="signup()"
            :disabled="disableSignUpButton"
          >
            Sign-up
          </button>
        </fieldset>
        <fieldset class="fieldset">
          <button id="signup-with-google" type="button" class="btn" @click="signupWithGoogle()">
            Sign-up with Google
          </button>
        </fieldset>
        <fieldset class="fieldset">
          <button id="signup-with-github" type="button" class="btn" @click="signupWithGitHub()">
            Sign-up with GitHub
          </button>
        </fieldset>
        <fieldset class="fieldset">
          <button id="signup-with-github" type="button" class="btn" @click="goToLoginPage()">
            Go to login page
          </button>
        </fieldset>
      </form>
    </div>
  </div>
</template>
