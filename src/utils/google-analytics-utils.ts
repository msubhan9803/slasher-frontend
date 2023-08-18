import { analyticsId, envValueForPubWiseAndGoogleAnalytics, osValueForPubWiseAndGoogleAnalytics } from '../constants';
import { store } from '../redux/store';
import { sleep } from './timer-utils';
import { getAppVersion } from './version-utils';

export function gtag(...args: any): any;
export function gtag(): any {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function sendEventHelper(callback: Function) {
  if (!analyticsId) { return; }
  const sendEvent = async () => {
    const isGoogleAnalyticsReady = store.getState().googleAnalytics.isReady;
    if (isGoogleAnalyticsReady) {
      callback();
    } else {
      await sleep(1000);
      await sendEvent();
    }
  };
  sendEvent();
}

export const sendAdUnitEventToGoogleAnalytics = (ad_unit_id: string) => {
  sendEventHelper(() => {
    gtag('event', 'ad_display', {
      ad_unit: ad_unit_id,
    });
  });
};

export const sendDebugTexttToGoogleAnalytics = (debugText: string) => {
  sendEventHelper(() => {
    gtag('event', 'debug_text', { debugText });
  });
};

export const sendUserPropertiesToGoogleAnalyticsOnPageLoad = () => {
  sendEventHelper(() => {
    gtag('set', 'user_properties', {
      slasher_app_version: getAppVersion(),
      os: osValueForPubWiseAndGoogleAnalytics,
      env: envValueForPubWiseAndGoogleAnalytics,
    });
  });
};
