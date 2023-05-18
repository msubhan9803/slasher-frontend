import axios from 'axios';
import { apiUrl } from '../constants';
import { getSessionToken } from '../utils/session-utils';

// TODO: Opinion? Might be useful in future as discussed.
// eslint-disable-next-line max-len
export async function getEventsByDistance(latitude: number, longitude: number, maxDistanceMiles: number) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?latitude=${latitude}&longitude=${longitude}&maxDistanceMiles=${maxDistanceMiles}`;
  return axios.get(`${apiUrl}/api/v1/events/by-distance${queryParameter}`, { headers });
}
