import { useState, useCallback } from 'react';
import { BREAK_POINTS } from '../constants';
import useResize from './useResize';
import { BreakPointName } from '../types';

const getBreakPointName = (currentWidth: number) => {
  let currentName = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const [breakPointName, width] of Object.entries(BREAK_POINTS)) {
    if (currentWidth > width) {
      currentName = breakPointName;
    }
  }
  return currentName as BreakPointName;
};

const useBootstrapBreakpointName = () => {
  const [breakpointName, setBreakpointName] = useState<BreakPointName>(
    getBreakPointName(window.innerWidth),
  );
  const resizeCallback = useCallback(() => {
    setBreakpointName(getBreakPointName(window.innerWidth));
  }, []);

  useResize(resizeCallback);

  return breakpointName;
};

export default useBootstrapBreakpointName;
