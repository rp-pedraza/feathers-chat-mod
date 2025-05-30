import { hasProperty, upcaseFirstLetter } from "@rp-pedraza/feathers-chat-mod-utils";

const getErrorMessage = (
  error: unknown,
  opts?: {
    upcaseFirstLetter?: boolean;
    prefix?: string;
  }
): string => {
  let errorMessage: string;

  if (typeof error === "string") {
    errorMessage = error;
  } else if (hasProperty(error, "errors") && Array.isArray(error.errors)) {
    errorMessage = error.errors.map((e) => `${e.schemaPath}: ${e.message}`).join("; ");
  } else if (hasProperty(error, "message", "string")) {
    errorMessage = error.message;
  } else if (hasProperty(error, "toString", "function")) {
    errorMessage = error.toString() as string;
  } else {
    let errorType: string = typeof error;

    if (errorType === "object") {
      errorType = (error as object).constructor.name;
    }

    errorMessage = "Invalid or unknown error type: " + errorType;
  }

  if (opts?.prefix) {
    errorMessage = opts.prefix + errorMessage;
  }

  if (opts?.upcaseFirstLetter) {
    errorMessage = upcaseFirstLetter(errorMessage);
  }

  return errorMessage;
};

export default getErrorMessage;
