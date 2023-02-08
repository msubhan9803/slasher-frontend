import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

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

export async function getConversation(matchListId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(`${apiUrl}/chat/conversation/${matchListId}`, { headers });
}

export async function createOrFindConversation(userId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.post(`${apiUrl}/chat/conversations/create-or-find-direct-message-conversation`, { userId }, { headers });
}

export async function markAllReadForSingleConversation(matchListId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.patch(`${apiUrl}/chat/conversations/mark-all-received-messages-read-for-chat/${matchListId}`, { headers });
}

export async function attachFile(message: string, file: any, conversationId: string) {
  const token = Cookies.get('sessionToken');
  const formData = new FormData();
  for (let i = 0; i < file.length; i += 1) {
    formData.append('files', file[i]);
  }
  formData.append('message', message);
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/chat/conversation/${conversationId}/message`, formData, { headers });
}
