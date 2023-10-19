import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';

export async function getUserFollow(page: number) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 10;
  const queryParameter = `?limit=${limit}&offset=${page * limit}`;
  return axios.get(`${apiUrl}/api/v1/user-follow/fetch-all-follow-user${queryParameter}`, { headers });
}
export async function checkFollowNotificationStatus(id: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/user-follow/${id}`, { headers });
}
export async function updateNotificationStatus(data: any) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.put(`${apiUrl}/api/v1/user-follow/follow-userId`, data, { headers });
}
export async function deleteNotificationStatus(id: any) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/user-follow/${id}`, { headers });
}
