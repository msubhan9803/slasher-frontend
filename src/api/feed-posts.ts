import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export async function getHomeFeedPosts(lastRetrievedPostId?: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=10';
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${apiUrl}/feed-posts${queryParameter}`, { headers });
}

export async function updateFeedPost(postId: string, message: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/feed-posts/${postId}`, { message }, { headers });
}
export async function deleteFeedPost(postId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/feed-posts/${postId}`, { headers });
}
