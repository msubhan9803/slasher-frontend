import { envValueForPubWiseAndGoogleAnalytics, osValueForPubWiseAndGoogleAnalytics } from '../constants';
import { getAppVersion } from './version-utils';
import { initializeFirebase } from './initFirebaseAnalytics';

async function sendEventHelper(name: string, param: object) {
  const firebaseApp = await initializeFirebase();
  firebaseApp.logEvent({
    name,
    params: param,
  });
}

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
    os: osValueForPubWiseAndGoogleAnalytics,
    env: envValueForPubWiseAndGoogleAnalytics,
  });
};
