import { apiUrl } from './constants';

export default function signIn(emailOrUsername: string, password: string) {
  const body = {
    emailOrUsername,
    password,
    device_id: '',
    device_token: '',
    device_type: 'browser',
    app_version: `web-${process.env.REACT_APP_VERSION}`,
    device_version: window.navigator.userAgent,
  };

  return fetch(`${apiUrl}users/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((response) => response.json());
}

export function register(
  firstName: string,
  userName: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  securityQuestion: string,
  securityAnswer: string,
  dob: string,
) {
  const body = {
    firstName,
    userName,
    email,
    password,
    passwordConfirmation,
    securityQuestion,
    securityAnswer,
    dob,
  };
  return fetch(`${apiUrl}users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((response) => response.json());
}
