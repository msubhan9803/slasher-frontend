import axios from 'axios';
import { apiUrl } from '../constants';

export async function healthCheck() {
  return axios.get(`${apiUrl}/health-check`);
}
