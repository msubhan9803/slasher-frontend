import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useScript from './useScript';

declare global {
  interface Window {
    dataLayer: any;
  }
}

const useGoogleAnalytics = (analyticsId?: string) => {
  const location = useLocation();
  const isLoaded = useScript(`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`, Boolean(!analyticsId));
  const previousPathRef = useRef<string>();

  const { pathname, search, hash } = location;

  const DISABLE_HOOK = typeof analyticsId === 'undefined';

  useEffect(() => {
    if (DISABLE_HOOK) { return; }
    if (!isLoaded) { return; }

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any): any;
    function gtag(): any {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    }

    const path = pathname + search + hash;
    if (previousPathRef.current === path) { return; }
    previousPathRef.current = path;

    gtag('js', new Date()); // necessary
    gtag('config', analyticsId); // necessary

    gtag('event', 'page_view', {
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location, isLoaded, analyticsId, hash, pathname, search, DISABLE_HOOK]);
};

export default useGoogleAnalytics;
