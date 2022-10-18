import axios from 'axios';
import Cookies from 'js-cookie';
import { toUtcStartOfDay, toUtcEndOfDay } from '../utils/date-utils';
import { apiUrl } from './constants';

export async function getEventCategoriesOption() {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/event-categories`, { headers });
}

export async function suggestEvent(
  name: string,
  userId: string,
  event_type: string,
  country: string,
  state: string,
  city: string,
  event_info: string,
  url: string,
  file: File | undefined,
  startDate: Date,
  endDate: Date,
  address: string,
) {
  const token = Cookies.get('sessionToken');
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  const formData = new FormData();
  formData.append('name', name);
  formData.append('userId', userId);
  formData.append('event_type', event_type);
  formData.append('country', country);
  formData.append('state', state);
  formData.append('city', city);
  formData.append('event_info', event_info);
  formData.append('url', url);
  formData.append('address', address);
  formData.append('startDate', toUtcStartOfDay(startDate).toISOString());
  formData.append('endDate', toUtcEndOfDay(endDate).toISOString());
  if (file) { formData.append('files', file); }

  return axios.post(
    `${apiUrl}/events`,
    formData,
    { headers },
  );
}
