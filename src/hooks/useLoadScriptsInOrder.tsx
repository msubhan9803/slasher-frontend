/* eslint-disable no-console,no-restricted-syntax,no-await-in-loop */
import { useEffect, useState } from 'react';

/**
 * This hook loads a array of script urls in order. You can pass first argument as array of
 * string URLs and also pass a second argument as true if you want to *disable* the hook.
*/
const useLoadScriptsInOrder = (URLs: string[], disableHook?: boolean) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (disableHook) return;
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
          });
        }
        setIsLoaded(true);
      } catch (error: any) {
        console.error('Slasher LOG: (failed to load PubWise scipts):', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    }

    main();
  }, [URLs, disableHook]);

  return isLoaded;
};

export default useLoadScriptsInOrder;
