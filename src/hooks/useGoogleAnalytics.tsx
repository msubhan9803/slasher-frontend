import { useEffect } from 'react';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';

declare global {
  interface Window {
    dataLayer: any;
  }
}

const useGoogleAnalytics = () => {
  useEffect(() => {
    alert('iniiit');

    const init = async () => {
      FirebaseAnalytics.initializeFirebase({
        apiKey: 'AIzaSyBOZ14-DVQ36zvoyGfVg49E9OyJeTlXrLk',
        authDomain: 'slasher-2023-fe951.firebaseapp.com',
        projectId: 'slasher-2023-fe951',
        storageBucket: 'slasher-2023-fe951.appspot.com',
        messagingSenderId: 'slasher-2023-fe951.appspot.com',
        appId: '1:399218252615:web:aee9373b0ba680e0068a62',
        measurementId: 'G-CR0V42WEMF',
      });
    };

    init();
  }, []);

  FirebaseAnalytics.logEvent({
    name: 'avadh_test',
    params: {
      page_location: 'test-location',
      page_title: 'test-title',
    },
  });
};

export default useGoogleAnalytics;
