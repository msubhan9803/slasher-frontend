/**
 * Escapes the given string so that it can be used within a regular expression.
 * @param str The string to escape.
 * @returns An escaped version of the given string.
 */
export const escapeStringRegexp = function (str: string) {
  // From https://stackoverflow.com/a/3561711
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // $& means the whole matched string
};
