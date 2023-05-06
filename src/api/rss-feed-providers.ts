import axios from 'axios';
import { apiUrl } from '../constants';
import { getSessionToken } from '../utils/session-utils';

export async function rssFeedInitialData() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/rss-feed-providers?limit=20`, { headers });
}

export async function getRssFeedProviderDetail(rssFeedProviderId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/rss-feed-providers/${rssFeedProviderId}`, { headers });
}

export async function getRssFeedProviderPosts(
  rssFeedProviderId: string,
  lastRetrievedPostId?: string,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=10';
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${apiUrl}/api/v1/rss-feed-providers/${rssFeedProviderId}/posts${queryParameter}`, { headers });
}

export async function getRssFeedProviderFollowUnfollow(
  rssFeedProviderId: string,
  userId: string,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/rss-feed-providers/${rssFeedProviderId}/follows/${userId}`, { headers });
}

export async function followRssFeedProvider(
  rssFeedProviderId: string,
  userId: string,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/rss-feed-providers/${rssFeedProviderId}/follows/${userId}`, {}, { headers });
}

export async function unfollowRssFeedProvider(
  rssFeedProviderId: string,
  userId: string,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/rss-feed-providers/${rssFeedProviderId}/follows/${userId}`, { headers });
}

export async function enableRssFeedProviderNotification(
  rssFeedProviderId: string,
  userId: string,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/rss-feed-providers/${rssFeedProviderId}/follows/${userId}/enable-notifications`, {}, { headers });
}

export async function disableRssFeedProviderNotification(
  rssFeedProviderId: string,
  userId: string,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/rss-feed-providers/${rssFeedProviderId}/follows/${userId}/disable-notifications`, {}, { headers });
}
