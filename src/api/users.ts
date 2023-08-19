/* eslint-disable max-lines */
import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { apiUrl } from '../env';
import { DeviceFields, RegisterUser } from '../types';
import { getDeviceToken, getSessionToken, getSessionUserId } from '../utils/session-utils';
import { getAppVersion } from '../utils/version-utils';

export async function signIn(emailOrUsername: string, password: string, signal?: AbortSignal) {
  let deviceFields: DeviceFields;
  if (Capacitor.isNativePlatform()) {
    const deviceId = await Device.getId();
    const deviceInfo = await Device.getInfo();
    deviceFields = {
      device_id: deviceId.identifier,
      device_token: (await getDeviceToken())!,
      device_type: deviceInfo.platform,
      app_version: getAppVersion(),
      device_version: `${deviceInfo.manufacturer} ${deviceInfo.model} ${deviceInfo.operatingSystem} ${deviceInfo.osVersion}, Name: ${deviceInfo.name}`,
    };
  } else {
    deviceFields = {
      device_id: 'browser',
      device_token: 'browser',
      device_type: 'browser',
      app_version: getAppVersion(),
      device_version: window.navigator.userAgent,
    };
  }
  return axios.post(
    `${apiUrl}/api/v1/users/sign-in`,
    {
      emailOrUsername,
      password,
      ...deviceFields,
    },
    { signal },
  );
}

export async function signOut() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const deviceId = await Device.getId();
  return axios.post(
    `${apiUrl}/api/v1/users/sign-out`,
    {
      device_id: deviceId.identifier,
    },
    { headers },
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
  reCaptchaToken: string,
) {
  return axios.post(
    `${apiUrl}/api/v1/users/register`,
    {
      firstName,
      userName,
      email,
      password,
      passwordConfirmation,
      securityQuestion,
      securityAnswer,
      dob,
      reCaptchaToken,
    },
  );
}

export async function validateRegistrationFields(
  {
    firstName,
    userName,
    email,
    password,
    passwordConfirmation,
    securityQuestion,
    securityAnswer,
    dob,
  }: RegisterUser,
) {
  return axios.get(
    `${apiUrl}/api/v1/users/validate-registration-fields`,
    {
      params: {
        firstName,
        userName,
        email,
        password,
        passwordConfirmation,
        securityQuestion,
        securityAnswer,
        dob,
      },
    },
  );
}

export async function forgotPassword(email: string) {
  return axios.post(`${apiUrl}/api/v1/users/forgot-password`, { email });
}

export async function userInitialData() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/users/initial-data`, { headers });
}

export async function getSuggestUserName(text: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/users/suggest-user-name?query=${text}&limit=10`, { headers });
}

export async function getUser(userName: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/users/${userName}`, { headers });
}
export async function getPublicProfile(userName: string) {
  return axios.get(`${apiUrl}/api/v1/users/public/${userName}`);
}

export async function getUserByPreviousUserName(userName: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/users/previous-username/${userName}`, { headers });
}

export async function getProfilePosts(id: string, lastRetrievedPostId?: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=10';
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${apiUrl}/api/v1/users/${id}/posts${queryParameter}`, { headers });
}

export async function userProfileFriends(signal: AbortSignal, userId: string, page: number, search = '') {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 36;
  let queryParameter = `?limit=${limit}&offset=${page * limit}`;
  if (search) {
    queryParameter += `&userNameContains=${search}`;
  }
  return axios.get(`${apiUrl}/api/v1/users/${userId}/friends${queryParameter}`, { headers, signal });
}

// export async function getUserProfileDetail(userName: string) {
//   const token = await getSessionToken();
//   const headers = {
//     Authorization: `Bearer ${token}`,
//   };
//   return axios.get(`${apiUrl}/api/v1/users/${userName}`, { headers });
// }

export async function updateUser(
  userName: string,
  firstName: string,
  email: string,
  id: string,
  profile_status: number,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/users/${id}`, {
    userName,
    firstName,
    email,
    profile_status,
  }, { headers });
}

export async function uploadUserProfileImage(file: File) {
  const token = await getSessionToken();
  const formData = new FormData();
  formData.append('file', file);
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/users/profile-image`, formData, { headers });
}

export async function uploadUserCoverImage(file: File) {
  const token = await getSessionToken();
  const formData = new FormData();
  formData.append('file', file);
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/users/cover-image`, formData, { headers });
}

export async function removeUserCoverImage() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/users/cover-image`, { headers });
}

export async function reomoveUserProfileImage() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/users/profile-image`, { headers });
}

export async function userPhotos(id: string, lastRetrievedPostId?: string, limit?: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = `?limit=${limit || '10'}`;
  if (lastRetrievedPostId) {
    queryParameter += `&before=${lastRetrievedPostId}`;
  }
  return axios.get(`${apiUrl}/api/v1/users/${id}/posts-with-images${queryParameter}`, { headers });
}

export async function getSuggestFriends() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/users/suggested-friends`, { headers });
}

export async function getUsersFriends(userId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/users/${userId}/friends?limit=3`, { headers });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/users/change-password`, {
    currentPassword, newPassword, newPasswordConfirmation,
  }, { headers });
}

export async function userAccountDelete() {
  const token = await getSessionToken();
  const userId = await getSessionUserId();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/users/${userId}?confirmUserId=${userId}`, { headers });
}

export async function updateUserAbout(
  id: string,
  aboutMe: string,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/users/${id}`, { aboutMe }, { headers });
}

export async function updateUserDeviceToken(
  device_id: string,
  device_token: string,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/users/update-device-token`, { device_id, device_token }, { headers });
}

export async function getUserMoviesList(
  name: string,
  search: string,
  userId: string,
  sortVal: string,
  key: string,
  lastRetrievedMovieId?: string | null,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = `?limit=10&sortBy=${sortVal}`;
  if (lastRetrievedMovieId) {
    queryParameter += `&after=${lastRetrievedMovieId}`;
  }
  if (search) {
    queryParameter += `&nameContains=${encodeURIComponent(search)}`;
  }
  if (key) {
    queryParameter += `&startsWith=${encodeURIComponent(key)}`;
  }
  return axios.get(`${apiUrl}/api/v1/users/${userId}/${name}${queryParameter}`, { headers });
}

export async function activateAccount(userId: string, token: string) {
  return axios.post(
    `${apiUrl}/api/v1/users/activate-account`,
    {
      userId,
      token,
    },
  );
}

export async function verificationEmailNotReceived(email: string) {
  return axios.post(
    `${apiUrl}/api/v1/users/verification-email-not-received`,
    {
      email,
    },
  );
}

export async function resetPassword(
  email: string,
  resetPasswordToken: string,
  newPassword: string,
  newPasswordConfirmation: string,
) {
  return axios.post(
    `${apiUrl}/api/v1/users/reset-password`,
    {
      email,
      resetPasswordToken,
      newPassword,
      newPasswordConfirmation,
    },
  );
}
