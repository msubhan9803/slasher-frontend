import { Location } from 'react-router-dom';

export const getPageName = (location: Location) => `${location.pathname}${location.search}${location.hash}`;

// We use `pageStateCache` to restore component data when user presss browser back/forward arrow
const pageStateCache = new Map<string, any>();
// Helper function to manage `pageStateCache`:
export const hasPageStateCache = (location: Location | string) => (typeof location === 'string'
  ? pageStateCache.has(location)
  : pageStateCache.has(getPageName(location)));
export const getPageStateCache = <T = any>(location: Location | string): T => (typeof location === 'string'
  ? pageStateCache.get(location)
  : pageStateCache.get(getPageName(location)));
export const setPageStateCache = <T>(location: Location | string, data: T) => (typeof location === 'string'
  ? pageStateCache.set(location, data)
  : pageStateCache.set(getPageName(location), data));
export const deletePageStateCache = (location: Location | string) => (typeof location === 'string'
  ? pageStateCache.delete(location)
  : pageStateCache.delete(getPageName(location)));

// Manage deleted post ids to filter out deleted posts, etc
export const deletedPostsCache = new Set();

// Manage blocked user ids to filter out posts from them
export const blockedUsersCache = new Set();

// For debugging purposes:
Object.assign(window, { psc: pageStateCache });
