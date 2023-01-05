import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function onboardingPhoto(
  file: any,
) {
  const token = Cookies.get('sessionToken');

  const formData = new FormData();
  formData.append('file', file);

  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/users/upload-profile-image`, formData, { headers });
}

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
