import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

// eslint-disable-next-line import/prefer-default-export
export async function createPost(message: string, file: any) {
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
  return axios.post(`${apiUrl}/feed-posts`, formData, { headers });
}
