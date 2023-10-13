// initFirebaseAnalytics.js

import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { analyticsJson } from '../env';

let firebaseApp : any;

const initializeFirebase = async () => {
  if (!firebaseApp) {
    try {
      firebaseApp = await FirebaseAnalytics.initializeFirebase(analyticsJson);

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
