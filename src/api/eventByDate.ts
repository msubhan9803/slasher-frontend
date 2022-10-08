import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

// eslint-disable-next-line import/prefer-default-export
export async function getEvents(startDate: string, endDate: string, lastRetrievedEventId = null) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = `?startDate=${startDate}&endDate=${endDate}&limit=10`;
  if (lastRetrievedEventId) {
    queryParameter += `&after=${lastRetrievedEventId}`;
  }
  return axios.get(`${apiUrl}/events${queryParameter}`, { headers });
}
