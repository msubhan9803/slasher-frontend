import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export async function blockedUsers(page: number) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 20;
  const queryParameter = `?limit=${limit}&offset=${page * limit}`;
  return axios.get(`${apiUrl}/blocks${queryParameter}`, { headers });
}

export async function removeBlockedUsers(userId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?userId=${userId}`;
  return axios.delete(`${apiUrl}/blocks${queryParameter}`, { headers });
}
