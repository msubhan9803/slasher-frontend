import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export async function getEvents() {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/events?startDate=2022-10-02T00:00:00Z&endDate=2022-10-02T23:59:59Z&limit=10`, { headers });
}

export async function getMoreEvents(lastRetrievedEventId : string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/events?startDate=2022-10-02T00:00:00Z&endDate=2022-10-02T23:59:59Z&limit=10&after=${lastRetrievedEventId}`, { headers });
}
