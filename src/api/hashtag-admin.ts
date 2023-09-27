import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';
import { HashtagsSortByType } from '../types';

type QueryParams = {
  sortBy: HashtagsSortByType,
  limit: number,
  after?: string,
};

type ResponseType = {
  data: {
    allItemsCount: number,
    items: Array<{
      _id: string
      name: string
      status: number
      createdAt: string
    }>
  }
};

export async function findAllHashtagAdmin(params: QueryParams): Promise<ResponseType> {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/hashtags`, { headers, params });
}
