/* eslint-disable max-lines */
import axios from 'axios';
import { apiUrl } from '../../constants';

export async function emailChangeConfirm(userId: string, token: string) {
  return axios.post(`${apiUrl}/api/v1/users/email-change/confirm`, { userId, token });
}

export async function emailChangeRevert(userId: string, token: string) {
  return axios.post(`${apiUrl}/api/v1/users/email-change/revert`, { userId, token });
}
