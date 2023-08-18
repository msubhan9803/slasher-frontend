import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';

export async function getEventsByRectangularArea(
  latitudeTopRight: number,
  longitudeTopRight: number,
  latitudeBottomLeft: number,
  longitudeBottomLeft: number,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?latitudeTopRight=${latitudeTopRight}&longitudeTopRight=${longitudeTopRight}&latitudeBottomLeft=${latitudeBottomLeft}&longitudeBottomLeft=${longitudeBottomLeft}`;
  return axios.get(`${apiUrl}/api/v1/events/by-rectangular-area${queryParameter}`, { headers });
}
