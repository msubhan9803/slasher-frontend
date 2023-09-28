import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';
import { HashtagActiveStatus, HashtagsSortByType } from '../types';

type QueryParams = {
  page: number,
  perPage: number,
  sortBy: HashtagsSortByType,
  nameContains?: string,
};

type HashTagResp = {
  _id: string
  name: string
  status: number
  createdAt: string
};

type FindAllResponseType = {
  data: {
    page: number
    perPage: number
    allItemsCount: number
    items: Array<HashTagResp>
  }
};

export async function findAllHashtagAdmin(
  queryParams: QueryParams,
): Promise<FindAllResponseType> {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/hashtags`, { headers, params: queryParams });
}
type UpdateHashResp = {
  data: HashTagResp
};

export async function updateHashtagStatusAdmin(
  id: string,
  hashtagStatus: HashtagActiveStatus,
): Promise<UpdateHashResp> {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.patch(`${apiUrl}/api/v1/hashtags/update-status/${id}`, { status: hashtagStatus }, { headers });
}
