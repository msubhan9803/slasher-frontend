import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

// eslint-disable-next-line import/prefer-default-export
export async function getSearchHashtag(page: number, query: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 10;
  const queryParameter = `?query=${query}&limit=${limit}&offset=${page * limit}`;
  return axios.get(`${apiUrl}/api/v1/search/hashtags${queryParameter}`, { headers });
}
