import apiUrl from './constants';

export default function signIn(emailOrUsername: string, password: string) {
  const body = {
    emailOrUsername,
    password,
    device_id: 1,
    device_token: 'wewewewew',
    device_type: 'mobile',
    app_version: 1.0,
    device_version: 2.9,
  };
  fetch(`${apiUrl}users/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((response) => response.json());
}

export function register(
  firstName: string,
  userName: string,
  email:string,
  password:string,
  passwordConfirmation:string,
  securityQuestion:string,
  securityAnswer:string,
  dob:string,
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
  fetch(`${apiUrl}users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((response) => response.json());
}
