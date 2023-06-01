import axios from 'axios';
import { apiUrl } from '../constants';
import { getSessionToken } from '../utils/session-utils';

// eslint-disable-next-line import/prefer-default-export
export async function getSearchUser(page: number, query: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 10;
  const queryParameter = `?query=${query}&limit=${limit}&offset=${page * limit}`;
  // if (lastRetrievedPostId) {
  //   queryParameter += `&before=${lastRetrievedPostId}`;
  // }
  return axios.get(`${apiUrl}/api/v1/search/users${queryParameter}`, { headers });
}
