import axios from 'axios';
import { apiUrl } from '../env';

export async function healthCheck() {
  return axios.get(`${apiUrl}/health-check`);
}
