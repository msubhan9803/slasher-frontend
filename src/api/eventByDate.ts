import axios from 'axios';
import { apiUrl } from '../constants';
import { getSessionToken } from '../utils/session-utils';

export async function getEvents(startDate: string, endDate: string, lastRetrievedEventId = null) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = `?startDate=${startDate}&endDate=${endDate}&limit=10`;
  if (lastRetrievedEventId) {
    queryParameter += `&after=${lastRetrievedEventId}`;
  }
  return axios.get(`${apiUrl}/api/v1/events/by-date-range${queryParameter}`, { headers });
}

export async function getEventsDateCount(startDate: string, endDate: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?startDate=${startDate}&endDate=${endDate}`;
  return axios.get(`${apiUrl}/api/v1/events/by-date-range/counts${queryParameter}`, { headers });
}
