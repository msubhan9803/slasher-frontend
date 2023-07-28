import { Capacitor } from '@capacitor/core';

// eslint-disable-next-line import/prefer-default-export
export const apiUrl = process.env.REACT_APP_API_URL;
export const captchaSiteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY || '';
export const analyticsId = process.env.REACT_APP_GOOGLE_ANALYTICS_PROPERTY_ID;
export const isNativePlatform = Capacitor.isNativePlatform();
export const enableDevFeatures = process.env.REACT_APP_ENABLE_DEV_ELEMENTS === 'true';

export const MAIN_CONTENT_ID = 'main-content';
export const RETRY_CONNECTION_BUTTON_ID = 'retry-connection-button';
export const COMMENT_OR_REPLY_INPUT = 'comment-or-reply-input';
export const COMMENT_SECTION_ID = 'comment-section-id';
export const MOBILE_NAVBAR = 'mobile-navbar';
export const AUTHENTICATED_PAGE_WRAPPER_ID = 'authenticated-page-wrapper';
export const SEND_BUTTON_COMMENT_OR_REPLY = 'send-comment-or-reply-button';
export const CHOOSE_FILE_CAMERA_ICON = 'choose-file-icon';

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

export const DEFAULT_USER_UPLOADED_CONTENT_ALT_TEXT = 'User uploaded content';

export const GOOGLE_PLAY_DOWNLOAD_URL = 'https://play.google.com/store/apps/details?id=com.sdei.slasher';
export const APP_STORE_DOWNLOAD_URL = 'https://apps.apple.com/app/id1458216326';

export const WORDPRESS_SITE_URL = 'https://pages.slasher.tv';

// Note: If the value below is changed, make sure that the Chat conversation page does not have
// a body scrollbar.  If it does, this value needs to be increased.
export const topToDivHeight = 110;

export const bottomMobileNavHeight = 80;
export const SERVER_UNAVAILABLE_TIMEOUT = 10_000;

export const topStatuBarBackgroundColorAndroidOnly = '000000';

// Note: This must be numeric value because we use this
// compare against return value of `useResize` hook
export const maxWidthForCommentOrReplyInputOnMobile: number = BREAK_POINTS.lg - 1;
export const bottomForCommentOrReplyInputOnMobile = '77px';

export const isDevelopmentServer = process.env.NODE_ENV === 'development';
