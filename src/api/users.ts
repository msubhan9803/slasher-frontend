import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export async function signIn(emailOrUsername: string, password: string) {
  return axios.post(
    `${apiUrl}/users/sign-in`,
    {
      emailOrUsername,
      password,
      device_id: 'browser',
      device_token: 'browser',
      device_type: 'browser',
      app_version: `web-${process.env.REACT_APP_VERSION}`,
      device_version: window.navigator.userAgent,
    },
  );
}

export async function register(
  firstName: string,
  userName: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  securityQuestion: string,
  securityAnswer: string,
  dob: string,
) {
  return axios.post(
    `${apiUrl}/users/register`,
    {
      firstName,
      userName,
      email,
      password,
      passwordConfirmation,
      securityQuestion,
      securityAnswer,
      dob,
    },
  );
}

export async function forgotPassword(email: string) {
  return axios.post(`${apiUrl}/users/forgot-password`, { email });
}

export async function checkUserName(userName: string) {
  return axios.get(`${apiUrl}/users/check-user-name?userName=${userName}`);
}

export async function checkUserEmail(email: string) {
  return axios.get(`${apiUrl}/users/check-email?email=${email}`);
}

export async function userInitialData() {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/users/initial-data`, { headers });
}
