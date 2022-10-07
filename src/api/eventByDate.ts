import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export async function getEvents(startDate : string, endDate : string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/events?startDate=${startDate}&endDate=${endDate}&limit=10`, { headers });
}

export async function getMoreEvents(
  startDate: string,
  endDate: string,
  lastRetrievedEventId: string,
) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/events?startDate=${startDate}&endDate=${endDate}&limit=10&after=${lastRetrievedEventId}`, { headers });
}
