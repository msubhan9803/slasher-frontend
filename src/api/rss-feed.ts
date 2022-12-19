import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export async function rssFeedInitialData() {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/rss-feed-providers?limit=20`, { headers });
}

export async function getRssFeedProviderDetail(rssFeedProviderId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/rss-feed-providers/${rssFeedProviderId}`, { headers });
}

export async function getRssFeedProviderPosts(
  rssFeedProviderId: string,
  lastRetrievedPostId?: string,
) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=10';
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${apiUrl}/rss-feed-providers/${rssFeedProviderId}/posts${queryParameter}`, { headers });
}
