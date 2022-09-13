import apiUrl from './constants';

export default function signIn(userName: string, password: string) {
  const body = {
    emailOrUsername: userName,
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
