import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken, getSessionUserId } from '../utils/session-utils';

export async function onboardingPhoto(
  file: any,
) {
  const token = await getSessionToken();

  const formData = new FormData();
  formData.append('file', file);

  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/users/profile-image`, formData, { headers });
}

export async function onboardingAboutMe(message: string) {
  const userId = await getSessionUserId();
  const token = await getSessionToken();
  return axios.patch(
    `${apiUrl}/api/v1/users/${userId}`,
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
