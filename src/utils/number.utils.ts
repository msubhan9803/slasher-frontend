/** Add decimal to a number only when necessary.
 * Usage:
 * addDecimalWhenNeeded(2) // 2
 * addDecimalWhenNeeded(2.0) // 2
 * addDecimalWhenNeeded(2.123) // 2.123
 */
export function addDecimalWhenNeeded(val: number, decimalPlaces = 1) {
  return parseFloat(val.toFixed(decimalPlaces));
}
