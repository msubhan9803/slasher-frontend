import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

// eslint-disable-next-line import/prefer-default-export
export async function feedPostDetail(id: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/feed-posts/${id}`, { headers });
}
