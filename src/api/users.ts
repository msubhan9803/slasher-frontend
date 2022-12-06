import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export async function signIn(emailOrUsername: string, password: string) {
  return axios.post(
    `${apiUrl}/users/sign-in`,
    {
      emailOrUsername,
      password,
      device_id: 'browser',
      device_token: 'browser',
      device_type: 'browser',
      app_version: `web-${process.env.REACT_APP_VERSION}`,
      device_version: window.navigator.userAgent,
    },
  );
}

export async function register(
  firstName: string,
  userName: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  securityQuestion: string,
  securityAnswer: string,
  dob: string,
) {
  return axios.post(
    `${apiUrl}/users/register`,
    {
      firstName,
      userName,
      email,
      password,
      passwordConfirmation,
      securityQuestion,
      securityAnswer,
      dob,
    },
  );
}

export async function forgotPassword(email: string) {
  return axios.post(`${apiUrl}/users/forgot-password`, { email });
}

export async function checkUserName(userName: string) {
  return axios.get(`${apiUrl}/users/check-user-name?userName=${userName}`);
}

export async function checkUserEmail(email: string) {
  return axios.get(`${apiUrl}/users/check-email?email=${email}`);
}

export async function userInitialData() {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/users/initial-data`, { headers });
}

export async function getSuggestUserName(text: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/users/suggest-user-name?query=${text}&limit=10`, { headers });
}

export async function getUser(userName: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/users/${userName}`, { headers });
}

export async function getProfilePosts(id: string, lastRetrievedPostId?: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=10';
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${apiUrl}/users/${id}/posts${queryParameter}`, { headers });
}

export async function userProfileFriends(userId: string, page: number, search = '') {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 18;
  let queryParameter = `?limit=${limit}&offset=${page * limit}`;
  if (search) {
    queryParameter += `&userNameContains=${search}`;
  }
  return axios.get(`${apiUrl}/users/${userId}/friends${queryParameter}`, { headers });
}

// export async function getUserProfileDetail(userName: string) {
//   const token = Cookies.get('sessionToken');
//   const headers = {
//     Authorization: `Bearer ${token}`,
//   };
//   return axios.get(`${apiUrl}/users/${userName}`, { headers });
// }

export async function updateUser(
  userName: string,
  firstName: string,
  email: string,
  id: string,
) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/users/${id}`, {
    userName,
    firstName,
    email,
  }, { headers });
}

export async function uploadUserProfileImage(file: File) {
  const token = Cookies.get('sessionToken');
  const formData = new FormData();
  formData.append('file', file);
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/users/upload-profile-image`, formData, { headers });
}

export async function uploadUserCoverImage(file: File) {
  const token = Cookies.get('sessionToken');
  const formData = new FormData();
  formData.append('file', file);
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/users/upload-cover-image`, formData, { headers });
}

export async function userPhotos(id: string, lastRetrievedPostId?: string, limit?: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = `?limit=${limit || '10'}`;
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${apiUrl}/users/${id}/posts-with-images${queryParameter}`, { headers });
}

export async function getSuggestFriends() {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/users/suggested-friends`, { headers });
}

export async function getUsersFriends() {
  const token = Cookies.get('sessionToken');
  const userId = Cookies.get('userId');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/users/${userId}/friends?limit=6`, { headers });
}

export async function userAccountDelete() {
  const token = Cookies.get('sessionToken');
  const userId = Cookies.get('userId');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/users/delete-account?userId=${userId}`, { headers });
}
