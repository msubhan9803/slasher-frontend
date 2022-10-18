import axios from 'axios';
import Cookies from 'js-cookie';
import { DateTime } from 'luxon';
import { apiUrl } from './constants';

export async function getEventCategoriesOption() {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/event-categories`, { headers });
}

export async function eventRegister(
  name: string,
  userId: string,
  event_type: string,
  country: string,
  state: string,
  city: string,
  event_info: string,
  url: string,
  file: File | undefined,
  startDate: Date | null,
  endDate : Date | null,
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
  if (file) { formData.append('files', file); }
  if (startDate) { formData.append('startDate', DateTime.fromJSDate(startDate).toFormat('yyyy-MM-dd')); }
  if (endDate) { formData.append('endDate', DateTime.fromJSDate(endDate).toFormat('yyyy-MM-dd')); }

  return axios.post(
    `${apiUrl}/events`,
    formData,
    { headers },
  );
}
