/* eslint-disable no-console,no-restricted-syntax,no-await-in-loop */
import { useEffect, useRef, useState } from 'react';

/**
 * This hook loads a array of script urls in order. You can pass first argument as array of
 * string URLs and also pass a second argument as true if you want to *disable* the hook.
*/
const useLoadScriptsInOrder = (URLs: string[], disableHook?: boolean) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<any>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (disableHook) { return; }
    // Run this hook only once for this component's lifecycle
    if (isMounted.current) { return; }
    isMounted.current = true;

    async function main() {
      try {
        // SEQUENTIAL LOADING OF SCRIPTS
        for (const url of URLs) {
          await new Promise((resolve) => {
            const tag = document.createElement('script');
            // tag.async = true;
            tag.src = url;
            const body = document.getElementsByTagName('body')[0];
            body.appendChild(tag);

            tag.addEventListener('load', resolve);
            tag.addEventListener('error', () => { setError(true); });
          });
        }
        setIsLoaded(true);
      } catch (err: any) {
        console.error('Slasher LOG: (failed to load TPD scipts):', {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
      }
    }

    main();
  }, [URLs, disableHook]);

  return { isScriptsLoaded: isLoaded, error };
};

export default useLoadScriptsInOrder;
