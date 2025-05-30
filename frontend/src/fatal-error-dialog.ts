import { mount } from "mount-vue-component";
import { type App, getCurrentInstance } from "vue";
import FatalErrorDialog from "./components/FatalErrorDialog.vue";
import getErrorMessage from "./utils/get-error-message";

const fatalErrorDialog = {
  registerComponent(app: App<unknown>) {
    app.component("FatalErrorDialog", FatalErrorDialog);
    return FatalErrorDialog;
  },
  install(app: App<unknown>) {
    return this.registerComponent(app);
  },
  show(
    error: unknown,
    opts?: {
      app?: App<unknown>;
      details?: Record<string, unknown>;
      logError?: boolean;
      prefix?: string;
    }
  ) {
    const prefix = opts?.prefix;

    if (opts?.logError) {
      if (error instanceof Error) {
        console.error(...[prefix, error.message].filter(Boolean));
        console.error("Error stack:", error.stack);
      } else {
        console.error(...[prefix, error].filter(Boolean));
      }
    }

    const app = opts?.app ?? getCurrentInstance()?.appContext.app;

    if (app === undefined) {
      console.error("App instance not found.");
      return;
    }

    const component = app.component("FatalErrorDialog") ?? this.registerComponent(app);
    const { destroy, el } = mount(component, {
      props: {
        error: getErrorMessage(error, { prefix, upcaseFirstLetter: true }),
        details: opts?.details,
        onClose: () => destroy()
      },
      app
    });
    (app._container as HTMLElement).appendChild(el);
  }
};

export default fatalErrorDialog;
