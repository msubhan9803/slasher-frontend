import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

// eslint-disable-next-line import/prefer-default-export
export async function onboardingAboutMe(message: string) {
  const userId = Cookies.get('userId');
  const token = Cookies.get('sessionToken');
  return axios.patch(
    `${apiUrl}/users/${userId}`,
    {
      aboutMe: message,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
