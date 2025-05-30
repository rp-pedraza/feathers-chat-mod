<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import client from "../client";
import logout from "../common/logout";
import reloadPage from "../common/reload-page";
import getErrorMessage from "../utils/get-error-message";

const { error, details } = defineProps<{ error?: unknown; details?: unknown }>();
const erroMessage = getErrorMessage(error);
const refinedDetails = !details
  ? undefined
  : typeof details === "string"
    ? details
    : JSON.stringify(details, null, 2);
const showDetails = ref(false);
const emit = defineEmits(["close"]);
const isLoggedIn = ref(client.authentication.authenticated);

const close = () => {
  useTemplateRef<HTMLDialogElement>("modal").value?.classList.remove("modal-open");
  emit("close");
};

const doLogout = () => {
  close();
  logout();
};

const doReloadPage = () => {
  close();
  reloadPage();
};

const toggleShowDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>

<template>
  <dialog ref="modal" class="modal modal-open">
    <div class="modal-box">
      <h3
        class="text-error font-bold inline-flex text-center items-center text-3xl gap-3 justify-center w-full"
      >
        <i class="i-heroicons-exclamation-triangle-solid-trimmed"></i>
        Fatal Error
      </h3>
      <p class="py-4 text-center">
        <span v-text="erroMessage"></span>
      </p>
      <div class="modal-action justify-evenly gap-5 mt-4">
        <form method="dialog" class="contents">
          <button class="btn flex grow-1 shrink-0 basis-0 h-12 sm:h-10" @click="doReloadPage">
            Reload Page
          </button>
          <button
            v-if="isLoggedIn"
            class="btn flex grow-1 shrink-0 basis-0 h-12 sm:h-10"
            @click="doLogout"
          >
            Logout
          </button>
          <button
            v-if="refinedDetails"
            class="btn flex grow-1 shrink-0 basis-0 h-12 sm:h-10"
            @click="toggleShowDetails"
            v-text="showDetails ? 'Hide Details' : 'Show Details'"
          ></button>
        </form>
      </div>
      <div
        class="mt-6 bg-base-300 max-h-full h-48 max-w-full overflow-auto"
        v-if="refinedDetails && showDetails"
      >
        <pre v-text="refinedDetails" class="whitespace-pre-wrap"></pre>
      </div>
    </div>
  </dialog>
</template>
