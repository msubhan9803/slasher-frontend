import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

// eslint-disable-next-line import/prefer-default-export
export async function getSearchUser(page: number, query: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 10;
  const queryParameter = `?query=${query}&limit=${limit}&offset=${page * limit}`;
  // if (lastRetrievedPostId) {
  //   queryParameter += `&before=${lastRetrievedPostId}`;
  // }
  return axios.get(`${apiUrl}/search/users${queryParameter}`, { headers });
}
