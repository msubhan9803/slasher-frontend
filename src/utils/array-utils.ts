/* eslint-disable import/prefer-default-export */

/**
 * Generates an array that holds numbers from min to max, inclusive.
 * Start and end can both be either positive, negative, or zero.
 */
export const generateRange = (start: number, end: number): number[] => {
  const arr = [];

  const iterationStart = start < end ? start : end;
  const iterationEnd = start < end ? end : start;

  for (let i = iterationStart; i <= iterationEnd; i += 1) {
    arr.push(i);
  }

  if (start > end) {
    arr.reverse();
  }

  return arr;
};
