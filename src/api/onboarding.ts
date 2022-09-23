import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

const userId = Cookies.get('userId');
const token = Cookies.get('sessionToken');
// eslint-disable-next-line import/prefer-default-export
export async function onboardingAboutMe(message: string) {
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
