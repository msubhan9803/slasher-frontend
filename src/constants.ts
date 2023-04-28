// eslint-disable-next-line import/prefer-default-export
export const apiUrl = process.env.REACT_APP_API_URL;
export const analyticsId = process.env.REACT_APP_GOOGLE_ANALYTICS_PROPERTY_ID;
// Note from Sahil: Added this log for short-term-debugging only!
// eslint-disable-next-line no-alert
alert(`apiUrl? ${apiUrl}`);

export const MAIN_CONTENT_ID = 'main-content';

export const BREAK_POINTS = {
  // NOTE: Break points below must be in ascending numeric order.
  // Other logic in the app relies on this order.
  xs: 0, sm: 576, md: 768, lg: 980, xl: 1200, xxl: 1440,
};

export const XS_MEDIA_BREAKPOINT = `${BREAK_POINTS.xs}px`;
export const SM_MEDIA_BREAKPOINT = `${BREAK_POINTS.sm}px`;
export const MD_MEDIA_BREAKPOINT = `${BREAK_POINTS.md}px`;
export const LG_MEDIA_BREAKPOINT = `${BREAK_POINTS.lg}px`;
export const XL_MEDIA_BREAKPOINT = `${BREAK_POINTS.xl}px`;
export const XXL_MEDIA_BREAKPOINT = `${BREAK_POINTS.xxl}px`;

export const enableADs = process.env.REACT_APP_ENABLE_ADS === 'true';

// 11 Sand Pond Rd, Hardwick Township, NJ
export const DEFAULT_EVENTS_USER_LOCATION = { lat: 41.055877, lng: -74.95479 };

export const GOOGLE_PLAY_DOWNLOAD_URL = 'https://play.google.com/store/apps/details?id=com.sdei.slasher';
export const APP_STORE_DOWNLOAD_URL = 'https://apps.apple.com/app/id1458216326';

export const topToDivHeight = 100;
