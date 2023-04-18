import { useEffect } from 'react';

function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, []);
  return null;
}

export default ScrollToTop;
