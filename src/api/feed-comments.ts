import axios from 'axios';
import { apiUrl } from '../constants';
import { getSessionToken } from '../utils/session-utils';
import { ContentDescription } from '../types';

export async function getFeedComments(
  feedPostId: string,
  lastRetrievedCommentId: string | undefined,
  isOldestFirst: boolean,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  let queryParameter = `?feedPostId=${feedPostId}&limit=20&sortBy=${isOldestFirst ? 'oldestFirst' : 'newestFirst'}`;
  if (lastRetrievedCommentId) {
    queryParameter += `&after=${lastRetrievedCommentId}`;
  }

  return axios.get(`${apiUrl}/api/v1/feed-comments${queryParameter}`, { headers });
}

export async function addFeedComments(
  feedPostId: string,
  message: string,
  file: any,
  descriptionArray?: any,
) {
  const token = await getSessionToken();
  const formData = new FormData();
  for (let i = 0; i < descriptionArray.length; i += 1) {
    if (file && file.length && file !== undefined) {
      if (file[i] !== undefined) {
        formData.append('images', file[i]);
      }
    }
    formData.append(`imageDescriptions[${[i]}][description]`, descriptionArray![i]);
  }
  formData.append('message', message);
  formData.append('feedPostId', feedPostId);
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/feed-comments`, formData, { headers });
}

export async function addFeedReplyComments(
  feedPostId: string,
  message: string,
  file: any,
  commentReplyId: string,
  descriptionArray?: string[],
) {
  const token = await getSessionToken();
  const formData = new FormData();
  for (let i = 0; i < file.length; i += 1) {
    formData.append('images', file[i]);
    formData.append(`imageDescriptions[${[i]}][description]`, descriptionArray![i]);
  }
  formData.append('message', message);
  formData.append('feedPostId', feedPostId);
  formData.append('feedCommentId', commentReplyId);
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/feed-comments/replies`, formData, { headers });
}

export async function removeFeedComments(feedCommentId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/feed-comments/${feedCommentId}`, { headers });
}

export async function removeFeedCommentReply(feedReplyId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/feed-comments/replies/${feedReplyId}`, { headers });
}

export async function updateFeedComments(
  feedPostId: string,
  message: string,
  feedCommentId: string,
  file: string[],
  imagesToDelete: string[] | undefined,
  descriptionArray?: ContentDescription[] | any,
) {
  const token = await getSessionToken();
  const formData = new FormData();
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
  formData.append('message', message);
  formData.append('feedPostId', feedPostId);
  if (imagesToDelete) {
    for (let i = 0; i < imagesToDelete.length; i += 1) {
      formData.append('imagesToDelete', imagesToDelete[i]);
    }
  }
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/feed-comments/${feedCommentId}`, formData, { headers });
}

export async function updateFeedCommentReply(
  feedPostId: string,
  message: string,
  feedReplyId: string,
  file: string[],
  imagesToDelete: string[] | undefined,
  descriptionArray?: ContentDescription[] | any,
) {
  const token = await getSessionToken();
  const formData = new FormData();
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
  formData.append('message', message);
  formData.append('feedPostId', feedPostId);
  if (imagesToDelete && imagesToDelete.length) {
    for (let i = 0; i < imagesToDelete.length; i += 1) {
      formData.append('imagesToDelete', imagesToDelete[i]);
    }
  }
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/feed-comments/replies/${feedReplyId}`, formData, { headers });
}

export async function singleComment(commentId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(`${apiUrl}/api/v1/feed-comments/${commentId}`, { headers });
}
