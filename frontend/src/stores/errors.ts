import { stash, unstash } from "json-stash";
import { remove } from "lodash-es";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import StoredError, { type StoredErrorInterface } from "../classes/stored-error";
import getErrorMessage from "../utils/get-error-message";

const validateStoredError = (storedError: unknown): storedError is StoredErrorInterface => {
  return (
    typeof storedError === "object" &&
    storedError !== null &&
    "id" in storedError &&
    typeof storedError.id === "number" &&
    "message" in storedError &&
    typeof storedError.message === "string" &&
    "domain" in storedError &&
    typeof storedError.domain === "string"
  );
};

const setupErrorsStore = () => {
  const errors = ref<Array<StoredErrorInterface>>([]);
  const lastErrorId = ref(0);

  function add(error: unknown | StoredError, opts?: { domain?: string; prefix?: string }) {
    let storedError: StoredErrorInterface;

    if (error instanceof StoredError || validateStoredError(error)) {
      storedError = error;
    } else {
      const errorMessage = getErrorMessage(error);

      storedError = new StoredError(errorMessage, opts?.domain ?? "general", lastErrorId.value + 1);
    }

    lastErrorId.value = storedError.id;
    errors.value.push(storedError);
  }

  function clear() {
    return errors.value.splice(0);
  }

  function takeAll(filter?: string | ((error: Readonly<StoredErrorInterface>) => boolean)) {
    let removed: Array<StoredErrorInterface>;

    if (!filter) {
      removed = errors.value.splice(0);
    } else if (typeof filter === "string") {
      removed = remove(errors.value, (e) => e.domain === filter);
    } else {
      removed = remove(errors.value, filter);
    }

    return removed;
  }

  const asMessages = computed(() => errors.value.map((e) => e.message));

  return { errors, lastErrorId, add, clear, takeAll, asMessages };
};

export const defineErrorsStore = (name: string) =>
  defineStore(name, setupErrorsStore, {
    persist: {
      key: name,
      storage: sessionStorage,
      pick: [name],
      serializer: {
        serialize: stash,
        deserialize: unstash
      }
    }
  });

export const useErrorsStore = defineErrorsStore("errors");
