import { useCallback, useState } from 'react';
import useResize from './useResize';

const useWindowInnerWidth = () => {
  const [windowInnerWidth, setWindowInnerWidth] = useState<number>(window.innerWidth);
  const resizeCallback = useCallback(() => { setWindowInnerWidth(window.innerWidth); }, []);

  useResize(resizeCallback);

  return windowInnerWidth;
};
export default useWindowInnerWidth;
