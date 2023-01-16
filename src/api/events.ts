import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export default async function getEventDetails(eventId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/events/${eventId}`, { headers });
}
