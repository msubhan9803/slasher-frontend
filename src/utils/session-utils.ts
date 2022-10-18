import Cookies from 'js-cookie';

export const setSignInCookies = (sessionToken: string, userId: string) => {
  Cookies.set('sessionToken', sessionToken);
  Cookies.set('userId', userId);
};

export const clearSignInCookies = () => {
  Cookies.remove('sessionToken');
  Cookies.remove('userId');
};
