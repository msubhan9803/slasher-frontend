/** Add decimal to a number only when necessary.
 * Usage:
 * formatNumberForRating(2) // 2
 * formatNumberForRating(2.0) // 2
 * formatNumberForRating(2.123) // 2.123
 */
export function formatNumberForRating(val: number, decimalPlaces = 1) {
  return parseFloat(val.toFixed(decimalPlaces));
}

/** This function converts a number to format: 1-9999, 10k, 10.1k-999k, 1M-1.1M */
export function formatNumberWithUnits(number: number) {
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}k`;
  }
  return number.toString();
}

/* Returns number of pages  */
export const getPageCount = (rowCount: number, pageSize: number) => {
  if (pageSize > 0 && rowCount > 0) {
    return Math.ceil(rowCount / pageSize);
  }
  return 0;
};
