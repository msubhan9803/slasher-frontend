import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initializeFirebase, sendAppInitialLogEvent, sendUserPropertiesToGoogleAnalyticsOnPageLoad } from '../utils/initFirebaseAnalytics';

const useGoogleAnalytics = () => {
  const location = useLocation();
  const previousPathRef = useRef<string>();

  const { pathname, search, hash } = location;

  useEffect(() => {
    const logAnalyticsEvent = async () => {
      try {
        // Initialize Firebase Analytics
        await initializeFirebase();
        const currentPath = pathname + search + hash;
        if (previousPathRef.current === currentPath) {
          return;
        }
        previousPathRef.current = currentPath;

        sendAppInitialLogEvent('page_view', {
          page_location: window.location.href,
          page_title: document.title,
        });
        sendUserPropertiesToGoogleAnalyticsOnPageLoad();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error initializing Firebase Analytics:', error);
      }
    };

    logAnalyticsEvent();
  }, [location, hash, pathname, search]);
};

export default useGoogleAnalytics;
