import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTopOnPathnameChange() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [location.pathname]);
  return null;
}

export default ScrollToTopOnPathnameChange;
