import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';

export async function getConversationMessages(
  conversationId: string,
  limit: number,
  before?: string,
  signal?: AbortSignal,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = `?limit=${limit}`;
  if (before) {
    queryParameter += `&before=${before}`;
  }
  return axios.get(`${apiUrl}/api/v1/chat/conversation/${conversationId}/messages${queryParameter}`, { headers, signal });
}
