import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

async function onboardingPhoto(
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

export default onboardingPhoto;
