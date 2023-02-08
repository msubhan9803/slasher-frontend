import { useEffect } from 'react';
import useLoadScriptsInOrder from './useLoadScriptsInOrder';
import { setPubWiseSlots } from '../redux/slices/pubWiseSlice';
import { useAppDispatch } from '../redux/hooks';
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
  MOVIE_FAVOURITE,
  MOVIE_FAVOURITE_DIV,
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

const INFINITE_ADS = [
  [HOME_WEB, HOME_WEB_DIV_ID],
  [NEWS_PARTNER_POSTS, NEWS_PARTNER_POSTS_DIV_ID],
  [NEWS, NEWS_DIV_ID],
  [EVENT_BY_DATE, EVENTS_BY_DATE_DIV_ID],
  [EVENTS_BY_LOCATION, EVENTS_BY_LOCATION_DIV_ID],
  [EVENTS_FAVOURITES, EVENTS_FAVOURITES_DIV_ID],
  [EVENT_DETAIL, EVENT_DETAIL_DIV_ID],
  [ALL_MOVIES, ALL_MOVIES_DIV_ID],
  [MOVIE_FAVOURITE, MOVIE_FAVOURITE_DIV],
  [MOVIE_WATCHLIST, MOVIE_WATCHLIST_DIV_ID],
  [MOVIE_WATCHED_LIST, MOVIE_WATCHED_LIST_DIV_ID],
  [MOVIE_BUY_LIST, MOVIE_BUY_LIST_DIV_ID],
  [MOVIE_INDIE, MOVIE_INDIE_DIV],
  [NEWS_PARTNER_DETAILS, NEWS_PARTNER_DETAILS_DIV_ID],
];

const SINGLES_ADS = [
  [GLOBAL_RIGHT_NAV, GLOBAL_RIGHT_NAV_DIV_ID],
];

const usePubWiseAdSlots = (enableADs: boolean) => {
  const dispatch = useAppDispatch();

  // Load scripts required for required for PubWise Adslots
  const isScriptsLoaded = useLoadScriptsInOrder([
    'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    '//fdyn.pubwise.io/script/786ead05-a265-491d-aeb6-cdbb8ad4cac7/v3/dyn/pre_pws.js?type=web',
    '//fdyn.pubwise.io/script/786ead05-a265-491d-aeb6-cdbb8ad4cac7/v3/dyn/pws.js?type=web',
  ], !enableADs);

  useEffect(() => {
    if (!enableADs) return;
    if (!isScriptsLoaded) return;

    // Run code after loading all the required pubwise scripts
    window.gptadslots = [];
    window.googletag ||= { cmd: [] };

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
            .addService(window.googletag.pubads());
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
          .addService(window.googletag.pubads());
      });

      // ENBLE GOOGLE TAG SERVICES
      window.googletag.enableServices();

      // Mark ad-slots as ready so we can try now load ads for any of those
      dispatch(setPubWiseSlots());
    });
  }, [isScriptsLoaded, dispatch, enableADs]);
};

export default usePubWiseAdSlots;
