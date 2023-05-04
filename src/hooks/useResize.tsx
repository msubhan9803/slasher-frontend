import { useEffect } from 'react';

/** The callback passed to the `useResize` will be executed on whenever resize event is fired. */
const useResize = (myCallback: any) => {
  useEffect(() => {
    window.addEventListener('resize', myCallback);

    return () => window.removeEventListener('resize', myCallback);
  }, [myCallback]);
};
export default useResize;
