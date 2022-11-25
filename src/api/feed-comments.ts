import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export async function getFeedComments(feedPostId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?feedPostId=${feedPostId}&limit=20`;

  return axios.get(`${apiUrl}/feed-comments${queryParameter}`, { headers });
}

export async function addFeedComments(
  userId: string,
  feedPostId: string,
  message: string,
  file: any,
) {
  const token = Cookies.get('sessionToken');
  const formData = new FormData();
  for (let i = 0; i < file.length; i += 1) {
    formData.append('files', file[i]);
  }
  formData.append('message', message);
  formData.append('feedPostId', feedPostId);
  formData.append('userId', userId);
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/feed-comments`, formData, { headers });
}
