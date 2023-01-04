import { useState, useEffect, useCallback } from 'react';

const sizes = [
  [0, 'xs'],
  [576, 'sm'],
  [768, 'md'],
  [992, 'lg'],
  [1200, 'xl'],
  [1440, 'xxl'],
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
