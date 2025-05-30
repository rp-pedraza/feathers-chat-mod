import { nextTick } from "process";
import {
  type App,
  onBeforeMount,
  onBeforeUnmount,
  onErrorCaptured,
  onMounted,
  watch,
  type WatchHandle
} from "vue";
import { type StoredErrorInterface } from "../classes/stored-error";
import fatalErrorDialog from "../fatal-error-dialog";
import { useErrorsStore } from "../stores/errors";
import { displayErrorMessage } from "../toast";
import getErrorMessage from "../utils/get-error-message";

const setupErrorHandling = (
  domain: string,
  opts?: {
    app?: App<unknown>;
    discardedErrorsSelector:
      | string
      | Array<string>
      | ((e: Readonly<StoredErrorInterface>) => boolean);
  }
) => {
  const errors = useErrorsStore();

  const addError = (error: unknown | StoredErrorInterface, prefix?: string) => {
    if (error instanceof Error) {
      console.error(...[prefix, error].filter(Boolean));
    } else {
      console.error(getErrorMessage(error, { prefix }));
    }

    nextTick(() => errors.add(error, { domain, prefix }));
  };

  onErrorCaptured((err: unknown) => {
    fatalErrorDialog.show(err, { app: opts?.app, logError: true });
  });

  const selector = opts?.discardedErrorsSelector;

  if (selector) {
    onBeforeMount(() => {
      if (typeof selector === "string") {
        errors.takeAll((e) => e.domain === selector);
      } else if (Array.isArray(selector)) {
        errors.takeAll((e) => selector.some((s) => e.domain === s));
      } else {
        errors.takeAll(selector);
      }
    });
  }

  let handler: WatchHandle | null = null;

  const dispatchError = (error: StoredErrorInterface) => {
    displayErrorMessage(getErrorMessage(error, { upcaseFirstLetter: true }));
  };

  onMounted(() => {
    errors.takeAll().forEach((e) => dispatchError(e));

    handler = watch(errors.errors, () => {
      errors.takeAll().forEach((e) => dispatchError(e));
    });
  });

  onBeforeUnmount(() => {
    if (handler) {
      handler.stop();
    }
  });

  return { errors, addError };
};

export default setupErrorHandling;
