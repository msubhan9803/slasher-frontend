import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { analyticsJson } from '../env';
import { getAppVersion } from './version-utils';
import { envValueForTpdAndGoogleAnalytics, osValueForTpdAndGoogleAnalytics } from '../constants';

let firebaseInitialized = false;
let firebaseAppInstance: typeof FirebaseAnalytics | null = null;

const sendEventHelper = async (name: string, param: object) => {
  try {
    FirebaseAnalytics.logEvent({
      name,
      params: param,
    });
  } catch (error) {
    /* eslint-disable no-console */
    console.error('Error sending analytics event:', error);
    throw error;
  }
};

export const sendUserPropertiesToGoogleAnalyticsOnPageLoad = () => {
  sendEventHelper('user_properties', {
    slasher_app_version: getAppVersion(),
    os: osValueForTpdAndGoogleAnalytics,
    env: envValueForTpdAndGoogleAnalytics,
  });
};

export const initializeFirebase = async () => {
  if (!firebaseInitialized) {
    try {
      const jsonObj = analyticsJson && analyticsJson.length ? JSON.parse(analyticsJson) : {};
      firebaseAppInstance = await FirebaseAnalytics.initializeFirebase(jsonObj);
      firebaseInitialized = true;
    } catch (error) {
      /* eslint-disable no-console */
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }
  return firebaseAppInstance;
};

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
