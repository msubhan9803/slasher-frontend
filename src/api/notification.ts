import axios from 'axios';
import { apiUrl } from '../constants';
import { getSessionToken } from '../utils/session-utils';

export async function getNotifications(lastRetrievedId?: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=10';
  if (lastRetrievedId) {
    queryParameter += `&before=${lastRetrievedId}`;
  }
  return axios.get(`${apiUrl}/api/v1/notifications${queryParameter}`, { headers });
}

export async function markAllRead() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/notifications/mark-all-as-read`, {}, { headers });
}

export async function markRead(notificationId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/notifications/${notificationId}/mark-as-read`, {}, { headers });
}
