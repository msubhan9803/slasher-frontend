import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useScript from './useScript';
import { useAppDispatch } from '../redux/hooks';
import { setIsGoogleAnalyticsReady } from '../redux/slices/googleAnalyticsSlice';
import { gtag, sendOsAndEnvEventToGoogleAnalytics } from '../utils/google-analytics-utils';

declare global {
  interface Window {
    dataLayer: any;
  }
}

const useGoogleAnalytics = (analyticsId?: string) => {
  const location = useLocation();
  const isLoaded = useScript(`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`, Boolean(!analyticsId));
  const previousPathRef = useRef<string>();
  const dispatch = useAppDispatch();

  const { pathname, search, hash } = location;

  const DISABLE_HOOK = typeof analyticsId === 'undefined';

  useEffect(() => {
    if (isLoaded) { dispatch(setIsGoogleAnalyticsReady()); }
  }, [dispatch, isLoaded]);

  // We should send `os` and `env` value only once on page load only.
  useEffect(() => {
    sendOsAndEnvEventToGoogleAnalytics();
  }, []);

  useEffect(() => {
    if (DISABLE_HOOK) { return; }
    if (!isLoaded) { return; }

    window.dataLayer = window.dataLayer || [];

    const currentPath = pathname + search + hash;
    if (previousPathRef.current === currentPath) { return; }
    previousPathRef.current = currentPath;

    gtag('js', new Date()); // necessary
    gtag('config', analyticsId); // necessary

    gtag('event', 'page_view', {
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location, isLoaded, analyticsId, hash, pathname, search, DISABLE_HOOK]);
};

export default useGoogleAnalytics;
