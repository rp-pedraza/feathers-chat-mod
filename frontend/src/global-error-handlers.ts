import { omitBy, pick } from "lodash-es";
import type { App } from "vue";
import fatalErrorDialog from "./fatal-error-dialog";
import { displayErrorMessage } from "./toast";

const globalErrorHandler = (app: App<unknown>) => {
  app.use(fatalErrorDialog);

  const getErrorEventError = (ev: ErrorEvent) => {
    if (ev.error) {
      return ev.error;
    } else if (ev.message) {
      return new Error(ev.message);
    } else if (ev.target) {
      const tagName = (ev.target as HTMLElement).tagName;
      return new Error(`unknown error occurred on <${tagName} /> element`);
    } else {
      return new Error("unknown error");
    }
  };

  const isEmpty = (value: unknown) => {
    return (
      value == null ||
      (typeof value === "object" && Object.keys(value).length === 0) ||
      (typeof value === "string" && value.trim() === "")
    );
  };

  const getErrorEventDetails = (ev: ErrorEvent) => {
    const details: Record<string, unknown> = omitBy(
      pick(ev, ["type", "error", "message", "filename", "lineno", "colno"]),
      isEmpty
    );

    if (ev.target) {
      const target = ev.target as HTMLElement & HTMLImageElement & HTMLAnchorElement;
      details.target = omitBy(
        pick(target, ["tagName", "id", "className", "href", "src", "alt"]),
        isEmpty
      );
    }

    return isEmpty(details) ? undefined : details;
  };

  function errorHandler(this: Window, ev: ErrorEvent) {
    ev.preventDefault();
    console.error("Unhandled error event:", ev);

    if ((ev.target as HTMLElement).tagName === "IMG") {
      displayErrorMessage(getErrorEventError(ev).message);
    } else {
      fatalErrorDialog.show(getErrorEventError(ev), {
        app,
        prefix: "Unhandled error: ",
        details: getErrorEventDetails(ev)
      });
    }
  }

  function promiseRejectionHandler(this: Window, ev: PromiseRejectionEvent) {
    ev.preventDefault();
    console.error("Unhandled promise rejection event:", ev);
    fatalErrorDialog.show(ev.reason, { app, prefix: "Unhandled promise rejection: " });
  }

  const registerGlobalErrorHandlers = () => {
    window.addEventListener("error", errorHandler, true);
    window.addEventListener("unhandledrejection", promiseRejectionHandler, true);
  };

  const unregisterGlobalErrorHandlers = () => {
    window.removeEventListener("error", errorHandler);
    window.removeEventListener("unhandledrejection", promiseRejectionHandler);
  };

  registerGlobalErrorHandlers();
  app.onUnmount(unregisterGlobalErrorHandlers);
};

export default globalErrorHandler;
