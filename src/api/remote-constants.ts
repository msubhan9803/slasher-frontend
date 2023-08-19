import axios from 'axios';
import { apiUrl } from '../env';

export async function fetchRemoteConstants() {
  return axios.get(`${apiUrl}/api/v1/remote-constants`);
}
