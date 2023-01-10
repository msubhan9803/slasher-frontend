import { useEffect } from 'react';
import useLoadScriptsInOrder from './useLoadScriptsInOrder';
import { setPubWiseSlots } from '../redux/slices/pubWiseSlice';
import { useAppDispatch } from '../redux/hooks';
import { GLOBAL_RIGHT_NAV, GLOBAL_RIGHT_NAV_DIV_ID } from '../utils/PubWiseAdUnits';

const usePubWiseAdSlots = () => {
  const dispatch = useAppDispatch();

  // Load scripts required for required for PubWise Adslots
  const isScriptsLoaded = useLoadScriptsInOrder([
    'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    '//fdyn.pubwise.io/script/786ead05-a265-491d-aeb6-cdbb8ad4cac7/v3/dyn/pre_pws.js?type=web',
    '//fdyn.pubwise.io/script/786ead05-a265-491d-aeb6-cdbb8ad4cac7/v3/dyn/pws.js?type=web',
  ]);

  useEffect(() => {
    if (!isScriptsLoaded) return;

    // Run code after loading all the required pubwise scripts
    window.gptadslots = [];
    window.googletag ||= { cmd: [] };

    window.googletag.cmd.push(() => {
      //
      // FOR PLACE HOLDER ADS
      //   SLOT 1: Event-detail_web
      // ===========================
      for (let series = 0; series < 20; series += 1) {
        for (let i = 0; i < 100; i += 1) {
          const id = `Event-detail_web-${series}-${i}`;
          window.gptadslots[id] = window.googletag
            .defineSlot(
              '/22756418014/Event-detail_web',
              [
                [300, 250],
              ],
              id,
            )
            .addService(window.googletag.pubads());
        }
      }

      // PRODUCTION AD-units
      // 1. Global Right Nav
      window.gptadslots[GLOBAL_RIGHT_NAV_DIV_ID] = window.googletag
        .defineSlot(
          GLOBAL_RIGHT_NAV,
          [
            [300, 250],
          ],
          GLOBAL_RIGHT_NAV_DIV_ID,
        )
        .addService(window.googletag.pubads());

      // ENBLE GOOGLE TAG SERVICES
      window.googletag.enableServices();

      // Mark ad-slots as ready so we can try now load ads for any of those
      dispatch(setPubWiseSlots());
    });
  }, [isScriptsLoaded]);
};

export default usePubWiseAdSlots;
