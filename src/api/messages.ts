import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export async function getMessagesList(lastRetrievedMessageId?: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=15';
  if (lastRetrievedMessageId) {
    queryParameter += `&before=${lastRetrievedMessageId}`;
  }
  return axios.get(`${apiUrl}/chat/conversations${queryParameter}`, { headers });
}

export async function getMatchIdDetail(matchListId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(`${apiUrl}/chat/conversation/${matchListId}`, { headers });
}

export async function getMatchListData(userId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.post(`${apiUrl}/chat/conversations/create-or-find-direct-message-conversation`, { userId }, { headers });
}
