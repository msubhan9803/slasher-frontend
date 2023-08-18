import { useEffect } from 'react';
import useLoadScriptsInOrder from './useLoadScriptsInOrder';
import { setAdBlockerDetected, setPubWiseSlots } from '../redux/slices/pubWiseSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  ALL_MOVIES,
  ALL_MOVIES_DIV_ID,
  EVENTS_BY_DATE_DIV_ID,
  EVENTS_BY_LOCATION,
  EVENTS_BY_LOCATION_DIV_ID,
  EVENTS_FAVOURITES,
  EVENTS_FAVOURITES_DIV_ID,
  EVENT_BY_DATE,
  EVENT_DETAIL,
  EVENT_DETAIL_DIV_ID,
  GLOBAL_RIGHT_NAV, GLOBAL_RIGHT_NAV_DIV_ID,
  HOME_WEB, HOME_WEB_DIV_ID,
  MOVIE_BUY_LIST,
  MOVIE_BUY_LIST_DIV_ID,
  MOVIE_FAVORITE,
  MOVIE_FAVORITE_DIV,
  MOVIE_INDIE,
  MOVIE_INDIE_DIV,
  MOVIE_WATCHED_LIST,
  MOVIE_WATCHED_LIST_DIV_ID,
  MOVIE_WATCHLIST,
  MOVIE_WATCHLIST_DIV_ID,
  NEWS, NEWS_DIV_ID,
  NEWS_PARTNER_DETAILS, NEWS_PARTNER_DETAILS_DIV_ID,
  NEWS_PARTNER_POSTS, NEWS_PARTNER_POSTS_DIV_ID,
} from '../utils/pubwise-ad-units';
import { envValueForPubWiseAndGoogleAnalytics, osValueForPubWiseAndGoogleAnalytics } from '../constants';

const INFINITE_ADS = [
  [HOME_WEB, HOME_WEB_DIV_ID],
  [NEWS_PARTNER_POSTS, NEWS_PARTNER_POSTS_DIV_ID],
  [NEWS, NEWS_DIV_ID],
  [EVENT_BY_DATE, EVENTS_BY_DATE_DIV_ID],
  [EVENTS_BY_LOCATION, EVENTS_BY_LOCATION_DIV_ID],
  [EVENTS_FAVOURITES, EVENTS_FAVOURITES_DIV_ID],
  [EVENT_DETAIL, EVENT_DETAIL_DIV_ID],
  [ALL_MOVIES, ALL_MOVIES_DIV_ID],
  [MOVIE_FAVORITE, MOVIE_FAVORITE_DIV],
  [MOVIE_WATCHLIST, MOVIE_WATCHLIST_DIV_ID],
  [MOVIE_WATCHED_LIST, MOVIE_WATCHED_LIST_DIV_ID],
  [MOVIE_BUY_LIST, MOVIE_BUY_LIST_DIV_ID],
  [MOVIE_INDIE, MOVIE_INDIE_DIV],
  [NEWS_PARTNER_DETAILS, NEWS_PARTNER_DETAILS_DIV_ID],
];

const SINGLES_ADS = [
  [GLOBAL_RIGHT_NAV, GLOBAL_RIGHT_NAV_DIV_ID],
];

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

const usePubWiseAdSlots = (enableADs: boolean) => {
  const dispatch = useAppDispatch();
  const isServerAvailable = useAppSelector((state) => state.serverAvailability.isAvailable);

  // Load scripts required for required for PubWise Adslots
  const { isScriptsLoaded, error } = useLoadScriptsInOrder([
    'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    'https://fdyn.pubwise.io/script/786ead05-a265-491d-aeb6-cdbb8ad4cac7/v3/dyn/pre_pws.js?type=web',
    'https://fdyn.pubwise.io/script/786ead05-a265-491d-aeb6-cdbb8ad4cac7/v3/dyn/pws.js?type=web',
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

    // Run code after loading all the required pubwise scripts
    window.gptadslots = [];
    window.googletag ||= { cmd: [] };

    window.googletag.pubads().setTargeting('iab_category', IABs);

    window.googletag.cmd.push(() => {
      INFINITE_ADS.forEach(([adUnitName, adUnitDivId]) => {
        for (let i = 0; i < 100; i += 1) {
          const id = `${adUnitDivId}-${i}`;
          window.gptadslots[id] = window.googletag
            .defineSlot(
              adUnitName,
              [
                [300, 250],
              ],
              id,
            )
            .addService(window.googletag.pubads())
            .setTargeting('os', osValueForPubWiseAndGoogleAnalytics)
            .setTargeting('env', envValueForPubWiseAndGoogleAnalytics);
        }
      });

      SINGLES_ADS.forEach(([adUnitName, adUnitDivId]) => {
        window.gptadslots[adUnitDivId] = window.googletag
          .defineSlot(
            adUnitName,
            [
              [300, 250],
            ],
            adUnitDivId,
          )
          .addService(window.googletag.pubads())
          .setTargeting('os', osValueForPubWiseAndGoogleAnalytics)
          .setTargeting('env', envValueForPubWiseAndGoogleAnalytics);
      });

      // ENBLE GOOGLE TAG SERVICES
      window.googletag.enableServices();

      // Mark ad-slots as ready so we can try now load ads for any of those
      dispatch(setPubWiseSlots());
    });
  }, [isScriptsLoaded, dispatch, enableADs]);
};

export default usePubWiseAdSlots;
