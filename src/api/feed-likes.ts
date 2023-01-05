import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function likeFeedPost(feedPostId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/feed-likes/post/${feedPostId}`, {}, { headers });
}

export async function unlikeFeedPost(feedPostId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/feed-likes/post/${feedPostId}`, { headers });
}

export async function likeFeedComment(feedCommentId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/feed-likes/comment/${feedCommentId}`, {}, { headers });
}

export async function unlikeFeedComment(feedCommentId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/feed-likes/comment/${feedCommentId}`, { headers });
}

export async function likeFeedReply(feedCommentId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/feed-likes/reply/${feedCommentId}`, {}, { headers });
}

export async function unlikeFeedReply(feedCommentId: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/feed-likes/reply/${feedCommentId}`, { headers });
}
