import { WaitForTimeoutError } from '../errors';

/**
 * Sleep for the given number of milliseconds.  Returns a promise that should be await-ed.
 * @param ms Number of milliseconds to sleep.
 * @returns A promise. Awaiting this promise in an async function will delay code execution for the duration supplied in param ms.
 */
export function sleep(ms: number) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

export async function waitForAsyncFunction(func: () => Promise<boolean>, timeoutInMillis: number, throwErrorIfConditionNeverMet = false) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutInMillis) {
    if (await func()) {
      return;
    }
    await sleep(100);
  }

  if (throwErrorIfConditionNeverMet) {
    throw new WaitForTimeoutError(`Exceeded waitFor timeout of ${timeoutInMillis} milliseconds`);
  }
}

export async function waitForSyncFunction(func: () => boolean, timeoutInMillis: number, throwErrorIfConditionNeverMet = false) {
  const syncFunctionAsAsyncFunction = async () => Promise.resolve(func());
  await waitForAsyncFunction(syncFunctionAsAsyncFunction, timeoutInMillis, throwErrorIfConditionNeverMet);
}
