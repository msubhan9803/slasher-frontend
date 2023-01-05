import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function userProfileFriendsRequest(page: number) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 18;
  const queryParameter = `?limit=${limit}&offset=${page * limit}`;
  return axios.get(`${apiUrl}/friends/requests/received${queryParameter}`, { headers });
}

export async function acceptFriendsRequest(userId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/friends/requests/accept`, { userId }, { headers });
}

export async function addFriend(userId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/friends`, { userId }, { headers });
}

export async function rejectFriendsRequest(userId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/friends?userId=${userId}`, { headers });
}

export async function removeSuggestedFriend(userId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/friends/suggested/block`, { userId }, { headers });
}

export async function friendship(userId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/friends/friendship?userId=${userId}`, { headers });
}
