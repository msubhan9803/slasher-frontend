import Cookies from 'js-cookie';

export const setSignInCookies = (sessionToken: string, userId: string, userName: string) => {
  Cookies.set('sessionToken', sessionToken);
  Cookies.set('userId', userId);
  Cookies.set('userName', userName);
};

export const updateUserName = (userName: string) => {
  Cookies.set('userName', userName);
};

export const clearSignInCookies = () => {
  Cookies.remove('sessionToken');
  Cookies.remove('userId');
  Cookies.remove('userName');
};
