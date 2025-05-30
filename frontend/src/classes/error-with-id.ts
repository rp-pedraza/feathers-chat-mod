import { hasProperty } from "@rp-pedraza/feathers-chat-mod-utils";
import DataWithID from "./data-with-id";

export interface ErrorWithIDInterface {
  id: number;
  value: Error;
}

export default class ErrorWithID extends DataWithID<Error> implements ErrorWithIDInterface {
  constructor(error: unknown, prefix: string = "", suggestedId?: number) {
    if (error instanceof ErrorWithID) {
      super(error.value, suggestedId);
    } else if (error instanceof Error) {
      super(error, suggestedId);
    } else if (typeof error === "string") {
      super(new Error(prefix + error), suggestedId);
    } else if (hasProperty(error, "message", "string")) {
      super(new Error(prefix + error.message), suggestedId);
    } else if (hasProperty(error, "toString", "function")) {
      super(new Error(prefix + error.toString()), suggestedId);
    } else {
      let errorType: string = typeof error;

      if (errorType === "object") {
        errorType = (error as object).constructor.name;
      }

      super(new Error(`Invalid or unknown error type: ${errorType}`));
    }
  }
}
