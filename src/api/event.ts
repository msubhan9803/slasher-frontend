import axios from 'axios';
import Cookies from 'js-cookie';
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
  startDate: any,
  endDate: any,
  country: string,
  state: string,
  city: string,
  event_info: string,
  url: string,
  files: File | null,
  author?: string,
) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const formData = new FormData();
  formData.append('name', name);
  formData.append('userId', userId);
  formData.append('event_type', event_type);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('country', country);
  formData.append('state', state);
  formData.append('city', city);
  formData.append('event_info', event_info);
  formData.append('url', url);

  return axios.post(
    `${apiUrl}/events`,
    {
      name,
      userId,
      event_type,
      startDate,
      endDate,
      country,
      state,
      city,
      event_info,
      url,
      author,
      files,
    },
  );
}
