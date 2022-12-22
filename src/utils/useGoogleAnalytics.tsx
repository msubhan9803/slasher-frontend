import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useScript from './useScript';

declare global {
  interface Window {
    dataLayer: any;
  }
}

const analyticsId = process.env.REACT_APP_GOOGLE_ANALYTICS || 'G-NWPS6ZB302'; // Temporary.

const useGoogleAnalytics = () => {
  const location = useLocation();
  const isLoaded = useScript(`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`);

  const { pathname, search, hash } = location;

  useEffect(() => {
    if (!isLoaded) return;

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any): any;
    function gtag(): any {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date()); // necessary
    gtag('config', analyticsId); // necessary

    gtag('event', 'page_view', {
      page_location: pathname + search + hash,
      page_title: document.title,
    });
  }, [location, isLoaded]);
};

export default useGoogleAnalytics;
