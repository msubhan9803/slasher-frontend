import Cookies from 'js-cookie';

export const setSignInCookies = (sessionToken: string, userId: string, userName: string) => {
  const onlySendCookieOverHttps = !['development', 'test'].includes(process.env.NODE_ENV);
  Cookies.set('sessionToken', sessionToken, { secure: onlySendCookieOverHttps });
  Cookies.set('userId', userId);
  Cookies.set('userName', userName);
};

export const updateUserName = (userName: string) => {
  const onlySendCookieOverHttps = !['development', 'test'].includes(process.env.NODE_ENV);
  Cookies.set('userName', userName, { secure: onlySendCookieOverHttps });
};

const clearSignInCookies = () => {
  Cookies.remove('sessionToken');
  Cookies.remove('userId');
  Cookies.remove('userName');
};

export const signOut = () => {
  clearSignInCookies();
  window.location.replace('/sign-in'); // redirect clears redux data and js caches
};
