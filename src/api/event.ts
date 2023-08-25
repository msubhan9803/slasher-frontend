import axios from 'axios';
import { toUtcStartOfDay, toUtcEndOfDay } from '../utils/date-utils';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';

export async function getEventCategoriesOption() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/event-categories`, { headers });
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
  file: File | null | undefined,
  startDate: Date | null,
  endDate: Date | null,
  address: string,
) {
  const token = await getSessionToken();
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
  formData.append('startDate', startDate ? toUtcStartOfDay(startDate).toISOString() : '');
  formData.append('endDate', endDate ? toUtcEndOfDay(endDate).toISOString() : '');
  if (file) { formData.append('files', file); }

  return axios.post(
    `${apiUrl}/api/v1/events`,
    formData,
    { headers },
  );
}
