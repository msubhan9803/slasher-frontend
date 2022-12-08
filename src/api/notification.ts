import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export async function getNotifications(lastRetrievedId?: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=10';
  if (lastRetrievedId) {
    queryParameter += `&before=${lastRetrievedId}`;
  }
  return axios.get(`${apiUrl}/notifications${queryParameter}`, { headers });
}
