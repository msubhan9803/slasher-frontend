import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';

export async function likeFeedPost(feedPostId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/feed-likes/post/${feedPostId}`, {}, { headers });
}

export async function unlikeFeedPost(feedPostId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/feed-likes/post/${feedPostId}`, { headers });
}

export async function likeFeedComment(feedCommentId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/feed-likes/comment/${feedCommentId}`, {}, { headers });
}

export async function unlikeFeedComment(feedCommentId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/feed-likes/comment/${feedCommentId}`, { headers });
}

export async function likeFeedReply(feedCommentId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/feed-likes/reply/${feedCommentId}`, {}, { headers });
}

export async function unlikeFeedReply(feedCommentId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/feed-likes/reply/${feedCommentId}`, { headers });
}

export async function getLikeUsersForReply(replyId: string, page: number) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 20;
  const queryParameter = `?limit=${limit}&offset=${page * limit}`;
  return axios.get(`${apiUrl}/api/v1/feed-likes/reply/${replyId}/users${queryParameter}`, { headers });
}

export async function getLikeUsersForComment(commentId: string, page: number) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 20;
  const queryParameter = `?limit=${limit}&offset=${page * limit}`;
  return axios.get(`${apiUrl}/api/v1/feed-likes/comment/${commentId}/users${queryParameter}`, { headers });
}
