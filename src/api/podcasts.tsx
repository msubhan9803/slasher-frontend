import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function getPodcasts() {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/podcasts`, { headers });
}
