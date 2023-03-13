import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function getEventsByRectangularArea(
  lattitudeTopRight: number,
  longitudeTopRight: number,
  lattitudeBottomLeft: number,
  longitudeBottomLeft: number,
) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?lattitudeTopRight=${lattitudeTopRight}&longitudeTopRight=${longitudeTopRight}&lattitudeBottomLeft=${lattitudeBottomLeft}&longitudeBottomLeft=${longitudeBottomLeft}`;
  return axios.get(`${apiUrl}/api/v1/events/by-rectangular-area${queryParameter}`, { headers });
}
