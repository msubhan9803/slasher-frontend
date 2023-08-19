export const apiUrl = process.env.REACT_APP_API_URL;
export const captchaSiteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY || '';
export const analyticsId = process.env.REACT_APP_GOOGLE_ANALYTICS_PROPERTY_ID;
export const enableDevFeatures = process.env.REACT_APP_ENABLE_DEV_ELEMENTS === 'true';
export const enableADs = process.env.REACT_APP_ENABLE_ADS === 'true';
export const isDevelopmentServer = process.env.NODE_ENV === 'development';
