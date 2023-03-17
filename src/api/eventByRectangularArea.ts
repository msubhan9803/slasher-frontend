import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function getEventsByRectangularArea(
  latitudeTopRight: number,
  longitudeTopRight: number,
  latitudeBottomLeft: number,
  longitudeBottomLeft: number,
) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?latitudeTopRight=${latitudeTopRight}&longitudeTopRight=${longitudeTopRight}&latitudeBottomLeft=${latitudeBottomLeft}&longitudeBottomLeft=${longitudeBottomLeft}`;
  return axios.get(`${apiUrl}/api/v1/events/by-rectangular-area${queryParameter}`, { headers });
}
