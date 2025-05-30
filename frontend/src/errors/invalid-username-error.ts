export default class InvalidUsernameError extends Error {
  constructor() {
    super("Username is invalid.");
  }
}
