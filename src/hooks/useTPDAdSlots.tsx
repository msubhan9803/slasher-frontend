import { useEffect } from 'react';
import useLoadScriptsInOrder from './useLoadScriptsInOrder';
import { setAdBlockerDetected, setTpdSlots } from '../redux/slices/tpdSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { osValueForTpdAndGoogleAnalytics, envValueForTpdAndGoogleAnalytics } from '../constants';

declare global {
  interface Window {
    googletag: any;
  }
}
const IABs = [
  'IAB1-5',
  'IAB1-6',
  'IAB1-7',
  'IAB9-5',
  'IAB9-7',
  'IAB9-11',
  'IAB9-25',
  'IAB9-26',
  'IAB9-30',
  'IAB10-6',
  'IAB18-2',
  'IAB19-17',
  'IAB19-29',
];

const useTPDAdSlots = (enableADs: boolean) => {
  const dispatch = useAppDispatch();
  const isServerAvailable = useAppSelector((state) => state.serverAvailability.isAvailable);

  // Load scripts required for required for TPD Adslots
  const { isScriptsLoaded, error } = useLoadScriptsInOrder([
    'https://cdn.tpdads.com/configs/slasher.js',
  ], !enableADs);

  useEffect(() => {
    if (error) {
      // Fix: Don't set ad-blocker detected when there is no connection at all
      if (!isServerAvailable) { return; }

      dispatch(setAdBlockerDetected(true));
    }
  }, [dispatch, error, isServerAvailable]);

  useEffect(() => {
    if (!enableADs) { return; }
    if (!isScriptsLoaded) { return; }

    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];
    window.googletag.cmd.push(() => {
      window.googletag.pubads().setTargeting('iab_category', IABs);
      window.googletag.pubads().setTargeting('os', osValueForTpdAndGoogleAnalytics);
      window.googletag.pubads().setTargeting('env', envValueForTpdAndGoogleAnalytics);
    });

    // Mark ad-slots as ready so we can try now load ads for any of those
    dispatch(setTpdSlots());
  }, [isScriptsLoaded, dispatch, enableADs]);
};

export default useTPDAdSlots;
