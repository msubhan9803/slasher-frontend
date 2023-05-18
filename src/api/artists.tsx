import axios from 'axios';
import { apiUrl } from '../constants';
import { getSessionToken } from '../utils/session-utils';

export async function getArtists() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/artists`, { headers });
}
