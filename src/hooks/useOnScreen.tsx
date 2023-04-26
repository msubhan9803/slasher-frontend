import {
  RefObject, useEffect, useMemo, useState,
} from 'react';

export default function useOnScreen(ref: RefObject<HTMLElement>) {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useMemo(() => new IntersectionObserver(
    ([entry]) => setIntersecting(entry.isIntersecting),
  ), []);

  useEffect(() => {
    observer.observe(ref.current as any);
    return () => observer.disconnect();
  }, [observer, ref]);

  return isIntersecting;
}
