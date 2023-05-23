import axios from 'axios';
import { apiUrl } from '../constants';
import { getSessionToken } from '../utils/session-utils';
import { ContentDescription } from '../types';

export async function getMessagesList(lastRetrievedMessageId?: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=30';
  if (lastRetrievedMessageId) {
    queryParameter += `&before=${lastRetrievedMessageId}`;
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

export async function attachFile(
  message: string,
  file: any,
  conversationId: string,
  descriptionArray?: ContentDescription[] | any,
) {
  const token = await getSessionToken();
  const formData = new FormData();
  for (let i = 0; i < descriptionArray.length; i += 1) {
    if (file && file.length && file !== undefined) {
      if (file[i] !== undefined) {
        formData.append('files', file[i]);
      }
    }
    if (descriptionArray![i].id) {
      formData.append(`imageDescriptions[${[i]}][_id]`, descriptionArray![i].id);
    }
    formData.append(`imageDescriptions[${[i]}][description]`, descriptionArray![i]);
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
