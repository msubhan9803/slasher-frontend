import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function getHomeFeedPosts(lastRetrievedPostId?: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=10';
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${apiUrl}/api/v1/feed-posts${queryParameter}`, { headers });
}

export async function feedPostDetail(id: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/feed-posts/${id}`, { headers });
}

export async function createPost(message: string, file: any) {
  const token = Cookies.get('sessionToken');
  const formData = new FormData();
  for (let i = 0; i < file.length; i += 1) {
    formData.append('files', file[i]);
  }
  formData.append('message', message);
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/feed-posts`, formData, { headers });
}

export async function updateFeedPost(postId: string, message: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/feed-posts/${postId}`, { message }, { headers });
}

export async function deleteFeedPost(postId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/feed-posts/${postId}`, { headers });
}

export async function hideFeedPost(postId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/feed-posts/${postId}/hide`, {}, { headers });
}

export async function getLikeUsersForPost(postId: string, page: number) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 20;
  const queryParameter = `?limit=${limit}&offset=${page * limit}`;
  return axios.get(`${apiUrl}/api/v1/feed-posts/${postId}/likes${queryParameter}`, { headers });
}
