import { upcaseFirstLetter } from "@rp-pedraza/feathers-chat-mod-utils";
import type { App } from "vue";
import Vue3Toasity, { toast } from "vue3-toastify";

export const toastPlugin = (app: App) => {
  app.use(Vue3Toasity, { autoClose: 5000, theme: "dark", transition: toast.TRANSITIONS.SLIDE });
};

export const displayInfoMessage = (messagae: string, opts?: { upcaseFirstLetter: boolean }) => {
  toast(opts?.upcaseFirstLetter ? upcaseFirstLetter(messagae) : messagae, { type: "info" });
};

export const displaySuccessMessage = (messagae: string, opts?: { upcaseFirstLetter: boolean }) => {
  toast(opts?.upcaseFirstLetter ? upcaseFirstLetter(messagae) : messagae, { type: "success" });
};

export const displayWarningMessage = (messagae: string, opts?: { upcaseFirstLetter: boolean }) => {
  toast(opts?.upcaseFirstLetter ? upcaseFirstLetter(messagae) : messagae, { type: "warning" });
};

export const displayErrorMessage = (messagae: string, opts?: { upcaseFirstLetter: boolean }) => {
  toast(opts?.upcaseFirstLetter ? upcaseFirstLetter(messagae) : messagae, { type: "error" });
};
