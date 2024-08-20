/* eslint-disable max-lines */
import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';
import { ContentDescription, PostType } from '../types';

export async function getHomeFeedPosts(allPosts: boolean, lastRetrievedPostId?: string) {
  const token = await getSessionToken();
  const url = allPosts ? `${apiUrl}/api/v1/feed-posts/all/post` : `${apiUrl}/api/v1/feed-posts`;
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=10';
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${url}${queryParameter}`, { headers });
}

export async function feedPostDetail(id: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/feed-posts/${id}`, { headers });
}

export async function createPost(
  postData: any,
  file: any,
  descriptionArray?: ContentDescription[],
) {
  const token = await getSessionToken();
  const formData = new FormData();
  for (let i = 0; i < file.length; i += 1) {
    formData.append('files', file[i]);
    if (descriptionArray) {
      formData.append(`imageDescriptions[${[i]}][description]`, descriptionArray![i].description);
    }
  }
  formData.append('message', postData.message);
  formData.append('postType', postData.postType);

  if (postData.businessListingRef) {
    formData.append('businessListingRef', postData.businessListingRef);
  }

  // Useful for `share-movie-as-post` and `movie-review-post`
  if (postData.movieId) {
    formData.append('movieId', postData.movieId);
  }
  const isMovieReviewPost = postData.postType === PostType.MovieReview;
  if (isMovieReviewPost) {
    formData.append('moviePostFields[spoilers]', postData.spoiler);
    if (postData.rate) {
      formData.append('moviePostFields[rating]', postData.rate);
    }
    if (postData.goreFactorRate) {
      formData.append('moviePostFields[goreFactorRating]', postData.goreFactorRate);
    }
    if (postData.worthIt) {
      formData.append('moviePostFields[worthWatching]', postData.worthIt);
    }
  }

  // Useful for `share-book-as-post` and `book-review-post`
  if (postData.bookId) {
    formData.append('bookId', postData.bookId);
  }
  const isBookReviewPost = postData.postType === PostType.BookReview;
  if (isBookReviewPost) {
    formData.append('bookPostFields[spoilers]', postData.spoiler);
    if (postData.rate && postData.postType === PostType.BookReview) {
      formData.append('bookPostFields[rating]', postData.rate);
    }
    if (postData.goreFactorRate && postData.postType === PostType.BookReview) {
      formData.append('bookPostFields[goreFactorRating]', postData.goreFactorRate);
    }
    if (postData.worthIt && postData.postType === PostType.BookReview) {
      formData.append('bookPostFields[worthReading]', postData.worthIt);
    }
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
  reviewPostData?: any,
  descriptionArray?: ContentDescription[] | any,
) {
  const token = await getSessionToken();
  const formData = new FormData();
  if (descriptionArray && descriptionArray.length) {
    for (let i = 0; i < descriptionArray.length; i += 1) {
      if (file && file.length && file !== undefined) {
        if (file[i] !== undefined) {
          formData.append('files', file[i]);
        }
      }
      if (descriptionArray![i].id) {
        formData.append(`imageDescriptions[${[i]}][_id]`, descriptionArray![i].id);
      }
      formData.append(`imageDescriptions[${[i]}][description]`, descriptionArray![i].description);
    }
  }
  formData.append('message', message);
  if (imagesToDelete) {
    for (let i = 0; i < imagesToDelete.length; i += 1) {
      formData.append('imagesToDelete', imagesToDelete[i]);
    }
  }
  if (reviewPostData?.postType === PostType.MovieReview) {
    formData.append('moviePostFields[spoilers]', reviewPostData.spoiler);
    formData.append('movieId', reviewPostData.movieId);
  }
  if (reviewPostData?.postType === PostType.MovieReview && reviewPostData?.rate) {
    formData.append('moviePostFields[rating]', reviewPostData.rate);
  }
  if (reviewPostData?.postType === PostType.MovieReview && reviewPostData?.goreFactorRate) {
    formData.append('moviePostFields[goreFactorRating]', reviewPostData.goreFactorRate);
  }
  if (reviewPostData?.postType === PostType.MovieReview && typeof reviewPostData?.worthIt === 'number') {
    formData.append('moviePostFields[worthWatching]', reviewPostData.worthIt);
  }
  if (reviewPostData?.postType === PostType.BookReview) {
    formData.append('bookPostFields[spoilers]', reviewPostData.spoiler);
    formData.append('bookId', reviewPostData.bookId);
  }
  if (reviewPostData?.postType === PostType.BookReview && reviewPostData?.rate) {
    formData.append('bookPostFields[rating]', reviewPostData.rate);
  }
  if (reviewPostData?.postType === PostType.BookReview && reviewPostData?.goreFactorRate) {
    formData.append('bookPostFields[goreFactorRating]', reviewPostData.goreFactorRate);
  }
  if (reviewPostData?.postType === PostType.BookReview && typeof reviewPostData?.worthIt === 'number') {
    formData.append('bookPostFields[worthReading]', reviewPostData.worthIt);
  }
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/feed-posts/${postId}`, formData, { headers });
}

export async function deleteFeedPost(postId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/feed-posts/${postId}`, { headers });
}

export async function hideFeedPost(postId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/feed-posts/${postId}/hide`, {}, { headers });
}

export async function getLikeUsersForPost(postId: string, page: number) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 20;
  const queryParameter = `?limit=${limit}&offset=${page * limit}`;
  return axios.get(`${apiUrl}/api/v1/feed-posts/${postId}/likes${queryParameter}`, { headers });
}

export async function getMovieReview(postId: string, lastRetrievedPostId?: string) {
  const token = await getSessionToken();
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

export async function getBookReview(postId: string, lastRetrievedPostId?: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 10;
  let queryParameter = `?limit=${limit}`;
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${apiUrl}/api/v1/feed-posts/${postId}/bookreviews${queryParameter}`, { headers });
}
export async function getHashtagPostList(hashTag: string, lastRetrievedPostId?: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 10;
  let queryParameter = `?limit=${limit}`;
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${apiUrl}/api/v1/feed-posts/hashtag/${hashTag}${queryParameter}`, { headers });
}

export async function getBusinessListingPosts(
  businessListingRef: string,
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
  return axios.get(`${apiUrl}/api/v1/feed-posts/business-listing-posts/${businessListingRef}${queryParameter}`, { headers });
}
