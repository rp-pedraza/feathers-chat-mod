export default class InvalidUserError extends Error {
  constructor(cause?: string) {
    super("Username is invalid" + (cause ? `: ${cause}` : ""));
  }
}
