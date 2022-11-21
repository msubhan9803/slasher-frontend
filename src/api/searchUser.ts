import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

// eslint-disable-next-line import/prefer-default-export
export async function getSearchUser(query: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?limit=10&query=${query}`;
  // if (lastRetrievedPostId) {
  //   queryParameter += `&before=${lastRetrievedPostId}`;
  // }
  return axios.get(`${apiUrl}/search/users${queryParameter}`, { headers });
}
