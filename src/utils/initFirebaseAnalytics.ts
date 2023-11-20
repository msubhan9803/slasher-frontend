import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { analyticsJson } from '../env';
import { getAppVersion } from './version-utils';
import { envValueForTpdAndGoogleAnalytics, osValueForTpdAndGoogleAnalytics } from '../constants';

let firebaseApp: any;

const initializeFirebase = async () => {
  if (!firebaseApp) {
    try {
      const jsonObj = analyticsJson && analyticsJson.length ? JSON.parse(analyticsJson) : {};
      firebaseApp = await FirebaseAnalytics.initializeFirebase(jsonObj);
    } catch (error) {
      /* eslint-disable no-console */
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }
  return firebaseApp;
};

async function sendEventHelper(name: string, param: object) {
  firebaseApp?.analytics().logEvent({
    name,
    params: param,
  });
}

export const sendAppInitialLogEvent = (name: string, param: object) => {
  sendEventHelper(name, param);
};

export const sendAdUnitEventToGoogleAnalytics = (ad_unit_id: string) => {
  sendEventHelper('ad_display', {
    ad_unit: ad_unit_id,
  });
};

export const sendDebugTexttToGoogleAnalytics = (debugText: string) => {
  sendEventHelper('debug_text', {
    debugText,
  });
};

export const sendUserPropertiesToGoogleAnalyticsOnPageLoad = () => {
  sendEventHelper('user_properties', {
    slasher_app_version: getAppVersion(),
    os: osValueForTpdAndGoogleAnalytics,
    env: envValueForTpdAndGoogleAnalytics,
  });
};

export { initializeFirebase };
