import Cookies from 'js-cookie';
import { clearLocalStorage } from './localstorage-utils';
import socketStore from '../socketStore';

export const setSignInCookies = (sessionToken: string, userId: string, userName: string) => {
  const onlySendCookieOverHttps = !['development', 'test'].includes(process.env.NODE_ENV);
  const DEFAULT_COOKIE_OPTIONS = {
    expires: 7, // Expire cookie in 7 days
  };
  Cookies.set('sessionToken', sessionToken, { secure: onlySendCookieOverHttps, ...DEFAULT_COOKIE_OPTIONS });
  Cookies.set('userId', userId, DEFAULT_COOKIE_OPTIONS);
  Cookies.set('userName', userName, DEFAULT_COOKIE_OPTIONS);
};

export const updateUserName = (userName: string) => {
  const onlySendCookieOverHttps = !['development', 'test'].includes(process.env.NODE_ENV);
  Cookies.set('userName', userName, { secure: onlySendCookieOverHttps });
};

const clearSignInCookies = () => {
  Cookies.remove('sessionToken');
  Cookies.remove('userId');
  Cookies.remove('userName');
  clearLocalStorage('spoilersIds');
};

export const signOut = () => {
  clearSignInCookies();
  window.location.replace('/app/sign-in'); // redirect clears redux data and js caches
  socketStore.socket?.disconnect();
  socketStore.socket = null;
};

export const getSessionToken = () => Cookies.get('sessionToken');
export const userIsLoggedIn = () => !!(getSessionToken());
