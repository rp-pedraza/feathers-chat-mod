<script setup lang="ts">
import { validateUsername, type User } from "@rp-pedraza/feathers-chat-mod-backend";
import { computed, onBeforeMount, ref } from "vue";
import authenticate from "../authenticate";
import client from "../client";
import getCurrentUserValidated from "../common/get-current-user-validated";
import getUsernameStatus from "../common/get-username-status";
import setupErrorHandling from "../common/setup-error-handling";
import usernameAvailable from "../common/username-available";
import InputField from "../components/InputField.vue";
import fatalErrorDialog from "../fatal-error-dialog";
import router from "../router";
import { displaySuccessMessage } from "../toast";
import type FieldStatus from "../types/field-status";
import type { FieldValidator } from "../types/field-validator";
import watchDebounced from "../utils/watch-debounced";

const currentUser = ref<User | null>();
const currentlyHasUsername = computed(() => currentUser.value?.username != null);
const mainTitle = ref("Choose Username");
const username = ref<string>();
const usernameStatus = ref<FieldStatus>();
const { addError } = setupErrorHandling("username");

const getCurrentUser = async () => {
  currentUser.value ??= await getCurrentUserValidated();
  return currentUser.value;
};

const validateUsernameField: FieldValidator = async (username: string | undefined) => {
  return await getUsernameStatus(username, await getCurrentUser(), addError);
};

onBeforeMount(async () => {
  const user = (currentUser.value ??= await getCurrentUserValidated());

  if (user.username) {
    username.value = user.username;
    mainTitle.value = "Update Username";
  } else if (user.usernameSuggestions) {
    username.value =
      user.usernameSuggestions
        .split(",")
        .find((suggeston) => validateUsername(suggeston) && usernameAvailable(suggeston)) || "";
  }
});

watchDebounced(username, async (newUsername: string | undefined) => {
  usernameStatus.value = await getUsernameStatus(newUsername, await getCurrentUser(), addError);
});

const updateButtonDisabled = computed(() => usernameStatus.value?.valid !== true);

const updateUsername = async () => {
  try {
    validateUsername(username.value);
  } catch (e: unknown) {
    addError(e, "Invalid username: ");
    return;
  }

  const { id, version } = await getCurrentUser();

  if (!id) {
    addError("User ID not found.");
    return;
  }

  try {
    await client.service("users").patch(id, { username: username.value, version });
  } catch (e: unknown) {
    addError(e, "Failed to update username: ");
    return;
  }

  displaySuccessMessage("Username updated successfully");
  currentUser.value = undefined;

  try {
    await authenticate({ force: true });
  } catch (e: unknown) {
    fatalErrorDialog.show(e, { prefix: "Failed to update user data: ", logError: true });
    return;
  }

  router.push("/chat"); // Don't await otherwise URI won't be updated
};

const logout = () => router.push("/logout");
const goToChatPage = () => router.push("/chat");
</script>

<template>
  <div class="flex min-h-screen bg-neutral justify-center items-center">
    <div class="card w-full max-w-sm bg-base-100 px-4 py-8 shadow-xl">
      <div class="px-4">
        <h1
          class="text-3xl font-bold text-center my-5 bg-clip-text bg-gradient-to-br"
          v-text="mainTitle"
        ></h1>
      </div>
      <form class="card-body pt-2">
        <InputField
          name="username"
          label="Username"
          placeholder="enter username"
          :required="true"
          :validator="validateUsernameField"
          v-model:value="username"
          v-model:status="usernameStatus"
        />
        <fieldset class="fieldset mt-5">
          <button
            type="button"
            class="btn"
            @click="updateUsername"
            :disabled="updateButtonDisabled"
          >
            Save changes
          </button>
        </fieldset>
        <fieldset class="fieldset mt-1" v-if="currentlyHasUsername">
          <button id="logout" type="button" class="btn" @click="goToChatPage">
            Go back to chat
          </button>
        </fieldset>
        <fieldset class="fieldset mt-1">
          <button id="logout" type="button" class="btn" @click="logout">Logout</button>
        </fieldset>
      </form>
    </div>
  </div>
</template>
