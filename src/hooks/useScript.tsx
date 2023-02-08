import { useEffect, useState } from 'react';

/**
 * This hook loads a script from a url. You can pass first argument as URL of
 * the script and also pass a second argument as true if you want to *disable* the hook.
*/
const useScript = (URL: string, disableHook?: boolean) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (disableHook) return;

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = URL;
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(tag);

    tag.addEventListener('load', () => {
      setIsLoaded(true);
    });
  }, [URL, disableHook]);

  return isLoaded;
};

export default useScript;
