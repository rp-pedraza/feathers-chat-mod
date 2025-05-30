import type { TextDecoration } from "./text-decoration";

export default interface DecoratedMessage {
  message: string;
  decoration: TextDecoration;
}
