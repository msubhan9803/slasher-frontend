import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

// eslint-disable-next-line import/prefer-default-export
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
