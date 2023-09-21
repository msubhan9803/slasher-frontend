import Cookies from 'js-cookie';
import { Preferences } from '@capacitor/preferences';
import { clearLocalStorage } from './localstorage-utils';
import socketStore from '../socketStore';
import { isNativePlatform } from '../constants';
import { sleep } from './timer-utils';

// Fix for SD-1542: https://slasher.atlassian.net/browse/SD-1542
// Because the api `await Preferences.get` is too slow and it causes the app the slow
// when we go back from post-posts -> post-details -> profile-posts page, thus it makes
// scroll-restore not possilbe
let cachedSessionToken: string | null = null;

const onlySendCookieOverHttps = !['development', 'test'].includes(process.env.NODE_ENV);
const DEFAULT_COOKIE_OPTIONS = {
  expires: 400, // Expire cookie in 400 days (400 is maximum allowed by google-chrome)
};
const SESSION_TOKEN_OPTIONS = { ...DEFAULT_COOKIE_OPTIONS, secure: onlySendCookieOverHttps };

export const setSignInCookies = async (sessionToken: string, userId: string, userName: string) => {
  if (!isNativePlatform) {
    // Set cookies
    Cookies.set('sessionToken', sessionToken, SESSION_TOKEN_OPTIONS);
    Cookies.set('userId', userId, DEFAULT_COOKIE_OPTIONS);
    Cookies.set('userName', userName, DEFAULT_COOKIE_OPTIONS);
  } else {
    // Use `Capacitor Preferences` api to cache user credentials in native storage for android and
    // ios devices for persistence after application is completely closed from recent-apps.
    await Preferences.set({ key: 'sessionToken', value: sessionToken });
    await Preferences.set({ key: 'userId', value: userId });
    await Preferences.set({ key: 'userName', value: userName });
  }
};
export const updateUserNameCookie = async (userName: string) => {
  if (!isNativePlatform) {
    Cookies.set('userName', userName, { secure: onlySendCookieOverHttps });
  } else {
    await Preferences.set({ key: 'userName', value: userName });
  }
};

const clearSignInCookies = async () => {
  if (!isNativePlatform) {
    Cookies.remove('sessionToken');
    Cookies.remove('userId');
    Cookies.remove('userName');
  } else {
    await Preferences.remove({ key: 'sessionToken' });
    cachedSessionToken = null;
    await Preferences.remove({ key: 'userId' });
    await Preferences.remove({ key: 'userName' });
  }
  clearLocalStorage('spoilersIds');
};
export const clearUserSession = async () => {
  await clearSignInCookies();
  await sleep(1_000);
  window.location.replace('/app/sign-in'); // redirect clears redux data and js caches
  socketStore.socket?.disconnect();
  socketStore.socket = null;
};
export const getSessionToken = async () => {
  if (!isNativePlatform) {
    const sessionToken = Cookies.get('sessionToken');
    if (sessionToken) { return sessionToken; }
  } else {
    if (cachedSessionToken) {
      return cachedSessionToken;
    }
    const token = (await Preferences.get({ key: 'sessionToken' })).value;
    cachedSessionToken = token;
    if (token) { return token; }
  }
  return null;
};
Object.assign(window, { c: clearSignInCookies, g: getSessionToken, Cookies });
export const getSessionUserId = async () => {
  if (!isNativePlatform) {
    const sessionUserId = Cookies.get('userId');
    if (sessionUserId) { return sessionUserId; }
  } else {
    const userId = (await Preferences.get({ key: 'userId' })).value;
    if (userId) { return userId; }
  }
  return null;
};
export const getSessionUserName = async () => {
  if (!isNativePlatform) {
    const sessionUserName = Cookies.get('userName');
    if (sessionUserName) { return sessionUserName; }
  } else {
    const userName = (await Preferences.get({ key: 'userName' })).value;
    if (userName) { return userName; }
  }
  return null;
};

export const getDeviceToken = async () => {
  const deviceToken = (await Preferences.get({ key: 'deviceToken' })).value;
  return deviceToken;
};

export const setDeviceToken = async (deviceToken: string) => {
  await Preferences.set({ key: 'deviceToken', value: deviceToken });
};
