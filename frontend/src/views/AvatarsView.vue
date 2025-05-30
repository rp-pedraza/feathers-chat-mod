<script setup lang="ts">
import {
  ALLOWED_IMAGE_MIME_TYPES,
  getMimeType,
  localAvatarValidator,
  localAvatarValidatorExtended,
  UPLOADED_AVATAR_MAXIMUM_SIZE,
  userValidator,
  validateImageMimeType,
  type LocalAvatar,
  type LocalAvatarData,
  type User
} from "@rp-pedraza/feathers-chat-mod-backend";
import assert from "assert";
import { sizeFormatter } from "human-readable";
import { isEqual } from "lodash-es";
import { computed, nextTick, onBeforeMount, reactive, ref, watchEffect } from "vue";
import authenticate from "../authenticate";
import RecordsSynchronizer from "../classes/records-synchronizer";
import client from "../client";
import getCurrentUserValidated from "../common/get-current-user-validated";
import logout from "../common/logout";
import setupErrorHandling from "../common/setup-error-handling";
import fatalErrorDialog from "../fatal-error-dialog";
import router from "../router";
import { displaySuccessMessage } from "../toast";
import createDataUri from "../utils/create-data-uri";
import getGravatarUri from "../utils/get-gravatar-uri";
import getTargetElementFromEvent from "../utils/get-target-element-from-event";
import testDataUriInImage from "../utils/test-data-uri-in-image";

type PreferredAvatar = "github" | "google" | "local" | "gravatar" | "" | undefined;

interface AvailableAvatar {
  value: string;
  uri: string;
  text: string;
}

const ACCEPTED_MIME_TYPES_STRING = ALLOWED_IMAGE_MIME_TYPES.join(", ");

const { addError } = setupErrorHandling("avatars");

const localAvatar = ref<LocalAvatarData & { uri?: string }>();
const preferredAvatar = ref<PreferredAvatar>();

const userService = client.service("users");
const localAvatarService = client.service("local-avatars");

const localAvatarCache = reactive([] as Array<LocalAvatar>);
const userCache = reactive([] as Array<User>);

const currentUserId = ref(0);
const currentUser = ref<User>();
const currentLocalAvatar = ref<LocalAvatar>();

const hasValidChanges = computed(() => {
  return (
    (localAvatar.value !== undefined && !isEqual(localAvatar.value, currentLocalAvatar.value)) ||
    preferredAvatar.value != currentUser.value?.preferredAvatar
  );
});

const availableAvatars = ref<Array<AvailableAvatar>>([]);

const userCacheSynchronizer = new RecordsSynchronizer(userCache, "users", userValidator, addError);

const localAvatarCacheSynchronizer = new RecordsSynchronizer(
  localAvatarCache,
  "local-avatars",
  localAvatarValidator,
  addError
);

const createLocalAvatarFromFile = async (file: File): Promise<LocalAvatarData> => {
  const size = file.size;

  if (size < 1 || size > UPLOADED_AVATAR_MAXIMUM_SIZE) {
    const format = sizeFormatter({ std: "JEDEC", decimalPlaces: 2, keepTrailingZeroes: false });
    throw new Error(`File size can't be empty or exceed ${format(UPLOADED_AVATAR_MAXIMUM_SIZE)}.`);
  }

  const data = await file.bytes();

  if (data.byteLength !== size) {
    throw new Error("Data size don't match file size.");
  }

  const mimeType = await getMimeType(data);

  if (!validateImageMimeType(mimeType)) {
    throw new Error("Invalid mime type");
  }

  const filename = file.name;

  return { data, filename };
};

const handleAvatarChanged = async (event: Event) => {
  const input = getTargetElementFromEvent<HTMLInputElement>(event);
  console.debug("input", input);

  if (input.value !== input.defaultValue) {
    const file = input.files?.item(0) ?? undefined;
    let avatar: (LocalAvatarData & { uri?: string }) | undefined;

    try {
      if (file) {
        avatar = await createLocalAvatarFromFile(file);
        avatar.uri = await createDataUri(avatar.data, file.type);

        if ((await testDataUriInImage(avatar.uri)) === false) {
          throw new Error("Invalid image data");
        }
      } else {
        avatar = currentLocalAvatar.value;
      }
    } catch (error: unknown) {
      addError(error);
      input.value = input.defaultValue;
      return;
    }

    localAvatar.value = avatar;
  }
};

onBeforeMount(async () => {
  console.debug("onBeforeMount");
  let user: User;

  try {
    user = await getCurrentUserValidated();
  } catch (error: unknown) {
    fatalErrorDialog.show(error, { prefix: "Failed to get current user: " });
    return;
  }

  currentUser.value = user;
  currentUserId.value = user.id;
  preferredAvatar.value = (user.preferredAvatar ?? "") as PreferredAvatar;
  userCache[user.id] = user;

  if (user.localAvatar) {
    const { data, filename } = user.localAvatar;
    localAvatar.value = { data, filename };
    localAvatarCache[user.localAvatar.id] = user.localAvatar;
    currentLocalAvatar.value = user.localAvatar;
  }

  watchEffect(async () => {
    const userId = currentUserId.value;
    const cachedUser = userCache.find((u) => u?.id === userId);

    if (cachedUser === undefined) {
      const errorMessage = "User data has been deleted.";

      addError(errorMessage);

      try {
        await authenticate({ force: true });
      } catch (e: unknown) {
        addError(e, "Failed to reauthenticate user: ");
      }

      nextTick(() => fatalErrorDialog.show(errorMessage, { logError: true }));
      return;
    }

    if (cachedUser && cachedUser.version > (currentUser.value?.version ?? 0)) {
      currentUser.value = await userValidator(cachedUser);
    }
  });

  watchEffect(async () => {
    const userId = currentUserId.value;
    const cachedLocalAvatar = localAvatarCache.find((a) => a?.userId === userId);

    if (!cachedLocalAvatar) {
      currentLocalAvatar.value = undefined;
    } else if (cachedLocalAvatar.version > (currentLocalAvatar.value?.version ?? 0)) {
      currentLocalAvatar.value = await localAvatarValidatorExtended(cachedLocalAvatar);
    }
  });

  watchEffect(async () => {
    const localAvatarDataUri = localAvatar.value?.data
      ? (localAvatar.value.uri ??= await createDataUri(localAvatar.value.data))
      : undefined;
    const user = currentUser.value;

    availableAvatars.value = [
      { value: "local", uri: localAvatarDataUri, text: "Local Avatar" },
      { value: "github", uri: user?.githubAvatar, text: "Github Avatar" },
      { value: "google", uri: user?.googleAvatar, text: "Google Avatar" },
      { value: "gravatar", uri: getGravatarUri(user?.email, 256), text: "Gravatar" }
    ].filter((option) => typeof option.uri === "string") as Array<AvailableAvatar>;
  });

  userCacheSynchronizer.activate();
  localAvatarCacheSynchronizer.activate();
});

const saveChanges = async () => {
  if (!hasValidChanges.value) {
    throw new Error("Unexpected call to saveChanges(): changes aren't valid");
  }

  if (localAvatar.value) {
    let newLocalAvatar: LocalAvatar;

    try {
      const { data, filename } = localAvatar.value;

      if (currentLocalAvatar.value) {
        const { id, version } = currentLocalAvatar.value;
        newLocalAvatar = await localAvatarService.patch(id, { data, filename, version });
      } else {
        console.debug("Using create");
        newLocalAvatar = await localAvatarService.create({ data, filename });
      }
    } catch (e: unknown) {
      addError(e, "Failed to update local avatar: ");
      return;
    }

    currentLocalAvatar.value = newLocalAvatar;
  }

  assert(currentUser.value !== undefined);
  assert(currentUser.value.id === currentUserId.value);

  if (preferredAvatar.value != currentUser.value.preferredAvatar) {
    const { id, version } = currentUser.value;

    try {
      currentUser.value = await userService.patch(id, {
        preferredAvatar: preferredAvatar.value || undefined,
        version
      });
    } catch (e: unknown) {
      addError(e, "Failed to update user: ");
      return;
    }
  }

  displaySuccessMessage("Changes saved successfully");

  try {
    await authenticate({ force: true });
  } catch (e: unknown) {
    addError(e, "Failed to reauthenticate user: ");
  }
};

const goToChatPage = () => router.push("/chat");
</script>

<template>
  <div class="flex min-h-screen bg-neutral justify-center items-center">
    <div class="card w-full max-w-md bg-base-100 px-4 py-8 shadow-xl">
      <div class="px-4">
        <h1 class="text-3xl font-bold text-center my-5 bg-clip-text bg-gradient-to-br">Avatars</h1>
      </div>
      <form class="card-body pt-2">
        <div id="avatars-main" class="grid grid-cols-2 justify-items-stretch gap-x-8 gap-y-4">
          <div
            class="card bg-neutral-900 min-h-56"
            v-for="avatar in availableAvatars"
            :key="avatar.text"
          >
            <figure>
              <img :alt="avatar.text" :src="avatar.uri" />
            </figure>
            <div class="card-body">
              <h2 v-text="avatar.text" class="text-center text-1xl font-bold"></h2>
            </div>
          </div>
        </div>
        <fieldset class="fieldset">
          <legend for="local-avatar" class="fieldset-legend">Local Avatar</legend>
          <input
            type="file"
            name="local-avatar"
            placeholder="local avatar file"
            class="input input-bordered w-full validator"
            @change="handleAvatarChanged"
            :accept="ACCEPTED_MIME_TYPES_STRING"
          />
        </fieldset>
        <fieldset class="fieldset">
          <legend for="preferred-avatar" class="fieldset-legend">Preferred Avatar</legend>
          <select name="preferred-avatar" class="select w-full" v-model="preferredAvatar">
            <option selected value="">No preferred avatar selected</option>
            <option
              v-for="option in availableAvatars"
              v-text="option.text"
              :value="option.value"
              :key="option.value"
            ></option>
          </select>
        </fieldset>
        <fieldset class="fieldset mt-5">
          <button type="button" class="btn" @click="saveChanges" :disabled="!hasValidChanges">
            Save changes
          </button>
        </fieldset>
        <fieldset class="fieldset mt-1">
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

<style>
input::file-selector-button {
  font-weight: bold;
  padding: 0.5em;
}
</style>
