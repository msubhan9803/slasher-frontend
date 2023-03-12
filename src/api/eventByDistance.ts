import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

// TODO: Opinion? Might be useful in future as discussed.
// eslint-disable-next-line max-len
export async function getEventsByDistance(lattitude: number, longitude: number, maxDistanceMiles: number) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?lattitude=${lattitude}&longitude=${longitude}&maxDistanceMiles=${maxDistanceMiles}`;
  return axios.get(`${apiUrl}/api/v1/events/by-distance${queryParameter}`, { headers });
}

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
