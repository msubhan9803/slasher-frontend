import axios from 'axios';
import { apiUrl } from '../constants';
import { getSessionToken } from '../utils/session-utils';

export async function getBooks() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/books`, { headers });
}
