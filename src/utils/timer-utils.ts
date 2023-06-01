/**
 * Sleep for the given number of milliseconds.  Returns a promise that should be await-ed.
 * @param ms Number of milliseconds to sleep.
 * @returns A promise. Awaiting this promise in an async function will delay code execution for the
 *          duration supplied in param ms.
 */
export function sleep(ms: number) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}
