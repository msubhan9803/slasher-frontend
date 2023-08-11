import { analyticsId } from '../constants';
import { gtag } from '../hooks/useGoogleAnalytics';
import { store } from '../redux/store';
import { sleep } from './timer-utils';

export const sendAdUnitEventToGoogleAnalytics = (ad_unit_id: string) => {
  if (!analyticsId) { return; }

  const sendEvent = async () => {
    const isGoogleAnalyticsReady = store.getState().googleAnalytics.isReady;
    if (isGoogleAnalyticsReady) {
      gtag('event', 'ad_display', {
        ad_unit: ad_unit_id,
      });
    } else {
      await sleep(1_000);
      await sendEvent();
    }
  };

  sendEvent();
};
