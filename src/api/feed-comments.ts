import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export async function getFeedComments(feedPostId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?feedPostId=${feedPostId}&limit=20`;

  return axios.get(`${apiUrl}/feed-comments${queryParameter}`, { headers });
}

export async function addFeedComments(
  feedPostId: string,
  message: string,
  file: any,
) {
  const token = Cookies.get('sessionToken');
  const formData = new FormData();
  for (let i = 0; i < file.length; i += 1) {
    formData.append('images', file[i]);
  }
  formData.append('message', message);
  formData.append('feedPostId', feedPostId);
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/feed-comments`, formData, { headers });
}

export async function addFeedReplyComments(
  feedPostId: string,
  message: string,
  file: any,
  commentReplyId: string,
) {
  const token = Cookies.get('sessionToken');
  const formData = new FormData();
  for (let i = 0; i < file.length; i += 1) {
    formData.append('images', file[i]);
  }
  formData.append('message', message);
  formData.append('feedPostId', feedPostId);
  formData.append('feedCommentId', commentReplyId)
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/feed-comments/replies`, formData, { headers });
}

export async function removeFeedComments(feedCommentId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/feed-comments/${feedCommentId}`, { headers });
}

export async function removeFeedCommentReply(feedReplyId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/feed-comments/replies/${feedReplyId}`, { headers });
}
