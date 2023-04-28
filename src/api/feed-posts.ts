import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';
import { PostType } from '../types';

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

export async function createPost(postData: any, file: any) {
  const token = Cookies.get('sessionToken');
  const formData = new FormData();
  for (let i = 0; i < file.length; i += 1) {
    formData.append('files', file[i]);
  }
  formData.append('message', postData.message);
  formData.append('postType', postData.postType);

  if (postData.postType === PostType.MovieReview) {
    formData.append('moviePostFields[spoilers]', postData.spoiler);
    formData.append('movieId', postData.movieId);
  }
  if (postData.rate) {
    formData.append('moviePostFields[rating]', postData.rate);
  }
  if (postData.goreFactorRate) {
    formData.append('moviePostFields[goreFactorRating]', postData.goreFactorRate);
  }
  if (postData.worthIt) {
    formData.append('moviePostFields[worthWatching]', postData.worthIt);
  }

  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/feed-posts`, formData, { headers });
}

export async function updateFeedPost(
  postId: string,
  message: string,
  file?: string[],
  imagesToDelete?: string[] | undefined,
  movieReviewPostData?: any,
) {
  const token = Cookies.get('sessionToken');
  const formData = new FormData();
  if (file && file.length) {
    for (let i = 0; i < file.length; i += 1) {
      formData.append('files', file[i]);
    }
  }
  formData.append('message', message);
  if (imagesToDelete) {
    for (let i = 0; i < imagesToDelete.length; i += 1) {
      formData.append('imagesToDelete', imagesToDelete[i]);
    }
  }
  if (movieReviewPostData?.postType === PostType.MovieReview) {
    formData.append('moviePostFields[spoilers]', movieReviewPostData.spoiler);
    formData.append('movieId', movieReviewPostData.movieId);
  }
  if (movieReviewPostData?.rate) {
    formData.append('moviePostFields[rating]', movieReviewPostData.rate);
  }
  if (movieReviewPostData?.goreFactorRate) {
    formData.append('moviePostFields[goreFactorRating]', movieReviewPostData.goreFactorRate);
  }
  if (movieReviewPostData?.worthIt) {
    formData.append('moviePostFields[worthWatching]', movieReviewPostData.worthIt);
  }
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/feed-posts/${postId}`, formData, { headers });
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

export async function getMovieReview(postId: string, lastRetrievedPostId?: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 10;
  let queryParameter = `?limit=${limit}`;
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${apiUrl}/api/v1/feed-posts/${postId}/reviews${queryParameter}`, { headers });
}

export async function getHashtagPostList(hashTag: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 10;
  const queryParameter = `?limit=${limit}`;
  return axios.get(`${apiUrl}/api/v1/feed-posts/hashtag/${hashTag}${queryParameter}`, { headers });
}
