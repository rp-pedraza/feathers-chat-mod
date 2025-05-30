/**
 * Converts the first character of a string to uppercase, leaving the rest of
 * the string unchanged unlike in functions named `capitalize`.
 *
 * @param {string} str The input string to be modified
 * @returns {string} A new string with the first character in uppercase
 */
const upcaseFirstLetter = (str: string) => String(str[0]).toUpperCase() + String(str).slice(1);

export default upcaseFirstLetter;
