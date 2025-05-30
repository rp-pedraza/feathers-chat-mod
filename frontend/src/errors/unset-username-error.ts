export default class UnsetUsernameError extends Error {
  constructor() {
    super("Username is unset.");
  }
}
