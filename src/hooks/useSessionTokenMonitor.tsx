import { useEffect, useState } from 'react';

/**
 * This hook periodically checks the given sessionTokenCheckFunction and when the returned value
 * changes it runs the given onChangeFunction.
*/
const useSessionTokenMonitor = (
  sessionTokenCheckFunction: () => string | undefined,
  onChangeFunction: () => void,
  checkInterval: number,
) => {
  const [lastKnownSessionToken] = useState(sessionTokenCheckFunction());

  useEffect(() => {
    const interval = setInterval(() => {
      const latestSessionToken = sessionTokenCheckFunction();
      if (lastKnownSessionToken !== latestSessionToken) { onChangeFunction(); }
    }, checkInterval);
    return () => { clearInterval(interval); };
  }, [lastKnownSessionToken, onChangeFunction, sessionTokenCheckFunction, checkInterval]);
};

export default useSessionTokenMonitor;
