import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';
import { ContentDescription } from '../types';

export async function getConversations(lastRetrievedConversationId?: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=30';
  if (lastRetrievedConversationId) {
    queryParameter += `&before=${lastRetrievedConversationId}`;
  }
  return axios.get(`${apiUrl}/api/v1/chat/conversations${queryParameter}`, { headers });
}

export async function getConversation(matchListId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(`${apiUrl}/api/v1/chat/conversation/${matchListId}`, { headers });
}

export async function createOrFindConversation(userId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.post(`${apiUrl}/api/v1/chat/conversations/create-or-find-direct-message-conversation`, { userId }, { headers });
}

export async function markAllReadForSingleConversation(matchListId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.patch(`${apiUrl}/api/v1/chat/conversations/mark-all-received-messages-read-for-chat/${matchListId}`, {}, { headers });
}

export async function sendMessageWithFiles(
  message: string,
  files: any,
  conversationId: string,
  fileDescriptions?: ContentDescription[] | any,
) {
  if (files.length !== fileDescriptions.length) {
    throw new Error('Number of uploaded files does not match number of descriptions.');
  }
  const token = await getSessionToken();
  const formData = new FormData();
  for (let i = 0; i < fileDescriptions.length; i += 1) {
    if (files && files.length && files !== undefined) {
      if (files[i] !== undefined) {
        formData.append('files', files[i]);
      }
    }
    formData.append(`imageDescriptions[${[i]}][description]`, fileDescriptions![i]);
  }
  formData.append('message', message);
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/chat/conversation/${conversationId}/message`, formData, { headers });
}

export async function deleteConversationMessages(matchListId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.delete(`${apiUrl}/api/v1/chat/conversation/${matchListId}`, { headers });
}
