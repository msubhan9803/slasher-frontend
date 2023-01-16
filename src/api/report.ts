import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function reportData(report: any) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/reports`, report, { headers });
}
