import { useEffect } from 'react';
import useLoadScriptsInOrder from './useLoadScriptsInOrder';
import { setPubWiseSlots } from '../redux/slices/pubWiseSlice';
import { useAppDispatch } from '../redux/hooks';

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
      //   SLOT 1: Event-detail_web
      // ===========================
      window.gptadslots['Event-detail_web'] = window.googletag
        .defineSlot(
          '/22756418014/Event-detail_web',
          [
            [320, 50],
            [300, 250],
          ],
          'Event-detail_web',
        )
        .addService(window.googletag.pubads());

      // SLOT 2: Timeline_web
      // ===========================
      window.gptadslots.Timeline_web = window.googletag
        .defineSlot(
          '/22756418014/Timeline_web',
          [
            [320, 50],
            [300, 250],
          ],
          'Timeline_web',
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
