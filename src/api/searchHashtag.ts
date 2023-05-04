import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function getSearchHashtag(page: number, query: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 10;
  const queryParameter = `?query=${query}&limit=${limit}&offset=${page * limit}`;
  return axios.get(`${apiUrl}/api/v1/search/hashtags${queryParameter}`, { headers });
}

export async function getSuggestHashtag(text: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/hashtags/suggest?query=${text}&limit=10`, { headers });
}

export async function getOnboardingSuggestedHashtag() {
  return axios.get(`${apiUrl}/api/v1/hashtags/onboarding-suggestions`);
}
