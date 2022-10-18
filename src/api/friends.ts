import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

// eslint-disable-next-line import/prefer-default-export
export async function userProfileFriendsRequest(count: number) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 18;
  const queryParameter = `?limit=${limit}&offset=${count * limit}`;
  return axios.get(`${apiUrl}/friends/requests/received${queryParameter}`, { headers });
}
