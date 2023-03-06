import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

// eslint-disable-next-line max-len
export async function getEventsByDistance(lattitude: number, longitude: number, maxDistanceMiles: number) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?lattitude=${lattitude}&longitude=${longitude}&maxDistanceMiles=${maxDistanceMiles}`;
  return axios.get(`${apiUrl}/api/v1/events/by-distance${queryParameter}`, { headers });
}
