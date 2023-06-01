import { useEffect, useState } from 'react';

/**
 * This hook periodically checks the given sessionTokenCheckFunction and when the returned value
 * changes it runs the given onChangeFunction.
*/
const useSessionTokenMonitorAsync = (
  sessionTokenCheckFunction: () => Promise<string | null>,
  onChangeFunction: () => void,
  checkInterval: number,
) => {
  const [lastKnownSessionToken, setLastKnownSessionToken] = useState({
    isLoading: true,
    token: null as (null | string),
  });

  /** Load `sessionToken` using `sessionTokenCheckFunction` on page load. */
  useEffect(() => {
    sessionTokenCheckFunction().then((token) => {
      setLastKnownSessionToken({ isLoading: false, token });
    }).catch(() => {
      setLastKnownSessionToken((state) => ({ ...state, isLoading: false }));
    });
  }, [sessionTokenCheckFunction]);

  /** Check every `checkInterval` seconds if the `latestSessionToken` is changed and
   * run `onChangeFunction` when it does. */
  useEffect(() => {
    if (lastKnownSessionToken.isLoading) { return undefined; }

    const interval = setInterval(async () => {
      const latestSessionToken = await sessionTokenCheckFunction();
      if (lastKnownSessionToken.token !== latestSessionToken) { onChangeFunction(); }
    }, checkInterval);
    return () => { clearInterval(interval); };
  }, [lastKnownSessionToken, onChangeFunction, sessionTokenCheckFunction, checkInterval]);
};

export default useSessionTokenMonitorAsync;
