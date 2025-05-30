import type DecoratedMessage from "./decorated-message";

export default interface FieldStatus {
  valid?: boolean | null;
  messages?: string | DecoratedMessage | Array<string | DecoratedMessage> | null;
}
