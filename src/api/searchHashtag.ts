import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';

export async function getSearchHashtag(page: number, query: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 10;
  const queryParameter = `?query=${query}&limit=${limit}&offset=${page * limit}`;
  return axios.get(`${apiUrl}/api/v1/search/hashtags${queryParameter}`, { headers });
}

export async function getSuggestHashtag(text: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/hashtags/suggest?query=${text}&limit=10`, { headers });
}
