import Cookies from 'js-cookie';
import { Preferences } from '@capacitor/preferences';
import { clearLocalStorage } from './localstorage-utils';
import socketStore from '../socketStore';
import { isNativePlatform } from '../constants';

export const setSignInCookies = async (sessionToken: string, userId: string, userName: string) => {
  // Set cookies
  const onlySendCookieOverHttps = !['development', 'test'].includes(process.env.NODE_ENV);
  const DEFAULT_COOKIE_OPTIONS = {
    expires: 400, // Expire cookie in 400 days (400 is maximum allowed by google-chrome)
  };
  Cookies.set('sessionToken', sessionToken, { ...DEFAULT_COOKIE_OPTIONS, secure: onlySendCookieOverHttps });
  Cookies.set('userId', userId, DEFAULT_COOKIE_OPTIONS);
  Cookies.set('userName', userName, DEFAULT_COOKIE_OPTIONS);

  // Use `Capacitor Preferences` api to cache user credentials in native storage for android and
  // ios devices for persistence after application is completely closed from recent-apps.
  if (isNativePlatform) {
    await Preferences.set({ key: 'sessionToken', value: sessionToken });
    await Preferences.set({ key: 'userId', value: userId });
    await Preferences.set({ key: 'userName', value: userName });
  }
};
export const updateUserNameCookie = async (userName: string) => {
  const onlySendCookieOverHttps = !['development', 'test'].includes(process.env.NODE_ENV);
  Cookies.set('userName', userName, { secure: onlySendCookieOverHttps });
  if (isNativePlatform) {
    await Preferences.set({ key: 'userName', value: userName });
  }
};

const clearSignInCookies = async () => {
  Cookies.remove('sessionToken');
  Cookies.remove('userId');
  Cookies.remove('userName');
  clearLocalStorage('spoilersIds');
  if (isNativePlatform) {
    await Preferences.clear();
  }
};
export const signOut = async () => {
  await clearSignInCookies();
  window.location.replace('/app/sign-in'); // redirect clears redux data and js caches
  socketStore.socket?.disconnect();
  socketStore.socket = null;
};
export const getSessionToken = async () => {
  const sessionToken = Cookies.get('sessionToken');
  if (sessionToken) { return sessionToken; }
  // Try to restore from native storage for capacitor app.
  if (isNativePlatform) {
    const token = (await Preferences.get({ key: 'sessionToken' })).value;
    if (token) {
      Cookies.set('sessionToken', token);
      return token;
    }
  }
  return null;
};
export const getSessionUserId = async () => {
  const sessionUserId = Cookies.get('userId');
  if (sessionUserId) { return sessionUserId; }
  // Try to restore from native storage for capacitor app.
  if (isNativePlatform) {
    const userId = (await Preferences.get({ key: 'userId' })).value;
    if (userId) {
      Cookies.set('userId', userId);
      return userId;
    }
  }
  return null;
};
export const getSessionUserName = async () => {
  const sessionUserName = Cookies.get('userName');
  if (sessionUserName) { return sessionUserName; }
  // Try to restore from native storage for capacitor app.
  if (isNativePlatform) {
    const userName = (await Preferences.get({ key: 'sessionToken' })).value;
    if (userName) {
      Cookies.set('userName', userName);
      return userName;
    }
  }
  return null;
};
