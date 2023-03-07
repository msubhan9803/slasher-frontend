/** Add decimal to a number only when necessary.
 * Usage:
 * formatNumberForRating(2) // 2
 * formatNumberForRating(2.0) // 2
 * formatNumberForRating(2.123) // 2.123
 */
export function formatNumberForRating(val: number, decimalPlaces = 1) {
  return parseFloat(val.toFixed(decimalPlaces));
}
