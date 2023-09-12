// initFirebaseAnalytics.js

import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';

let firebaseApp : any;

const initializeFirebase = async () => {
  if (!firebaseApp) {
    try {
      firebaseApp = await FirebaseAnalytics.initializeFirebase({
        apiKey: 'AIzaSyBOZ14-DVQ36zvoyGfVg49E9OyJeTlXrLk',
        authDomain: 'slasher-2023-fe951.firebaseapp.com',
        projectId: 'slasher-2023-fe951',
        storageBucket: 'slasher-2023-fe951.appspot.com',
        messagingSenderId: 'slasher-2023-fe951.appspot.com',
        appId: '1:399218252615:web:aee9373b0ba680e0068a62',
        measurementId: 'G-CR0V42WEMF',
      });

      return firebaseApp;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Firebase initialization error:', error);
      throw error;
    }
  } else {
    return firebaseApp;
  }
};

export { initializeFirebase };
