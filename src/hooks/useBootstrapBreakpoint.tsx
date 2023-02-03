import { useState, useEffect, useCallback } from 'react';
import {
  LG_MEDIA_BREAKPOINT, MD_MEDIA_BREAKPOINT, SM_MEDIA_BREAKPOINT, XL_MEDIA_BREAKPOINT,
  XS_MEDIA_BREAKPOINT, XXL_MEDIA_BREAKPOINT,
} from '../constants';

const sizes = [
  [XS_MEDIA_BREAKPOINT.split('px')[0], 'xs'],
  [SM_MEDIA_BREAKPOINT.split('px')[0], 'sm'],
  [MD_MEDIA_BREAKPOINT.split('px')[0], 'md'],
  [LG_MEDIA_BREAKPOINT.split('px')[0], 'lg'],
  [XL_MEDIA_BREAKPOINT.split('px')[0], 'xl'],
  [XXL_MEDIA_BREAKPOINT.split('px')[0], 'xxl'],
];

const getBrkPoints = (currentWidth: number) => {
  let currentName = '';
  for (let i = 0; i < sizes.length; i += 1) {
    const [width, name] = sizes[i];
    if (currentWidth > Number(width)) {
      currentName = String(name);
    }
  }
  return currentName;
};

const useBootstrapBreakpointName = () => {
  const [breakpointName, setBreakpointName] = useState(getBrkPoints(window.innerWidth));
  const resizeCallback = useCallback(() => {
    setBreakpointName(getBrkPoints(window.innerWidth));
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resizeCallback);

    return () => window.removeEventListener('resize', resizeCallback);
  }, []);

  return breakpointName;
};

export default useBootstrapBreakpointName;
