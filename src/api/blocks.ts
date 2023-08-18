import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';
import { store } from '../redux/store';
import { forceReloadSuggestedFriends } from '../redux/slices/suggestedFriendsSlice';
import { removeBlockedUserFromRecentMessages } from '../redux/slices/userSlice';
import { blockedUsersCache } from '../pageStateCache';

export async function blockedUsers(page: number) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const limit = 20;
  const queryParameter = `?limit=${limit}&offset=${page * limit}`;
  return axios.get(`${apiUrl}/api/v1/blocks${queryParameter}`, { headers });
}

export async function removeBlockedUsers(userId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParameter = `?userId=${userId}`;
  return axios.delete(`${apiUrl}/api/v1/blocks${queryParameter}`, { headers });
}

export async function createBlockUser(userId: string) {
  const token = await getSessionToken();
  // Make `suggestedFriends` to be forcely reloaded via api so the blocked user
  // would be ommited when we fetch `suggestedFriends` on home page in future.
  store.dispatch(forceReloadSuggestedFriends());
  // Remove blocked user message from RecentMessages in the Sidebar
  store.dispatch(removeBlockedUserFromRecentMessages({ blockUserId: userId }));
  // Add blockedUserId to cache to help filter pageStateCache data on browser back/forward action
  blockedUsersCache.add(userId);
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/blocks`, { userId }, { headers });
}
