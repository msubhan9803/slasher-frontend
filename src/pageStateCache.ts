/* eslint-disable max-len */
import { LocationOrPathname } from './types';

export const getPageName = (location: LocationOrPathname) => (typeof location === 'string'
  ? location
  : `${location.pathname}${location.search}${location.hash}`);

// We use `pageStateCache` to restore component data when user presss browser back/forward arrow
const pageStateCache = new Map<string, any>();
// Helper function to manage `pageStateCache`:
export const hasPageStateCache = (location: LocationOrPathname) => pageStateCache.has(getPageName(location));
export const getPageStateCache = <T = any>(location: LocationOrPathname): T => pageStateCache.get(getPageName(location));
export const setPageStateCache = <T>(location: LocationOrPathname, data: T) => pageStateCache.set(getPageName(location), data);
export const deletePageStateCache = (location: LocationOrPathname) => pageStateCache.delete(getPageName(location));

// Manage deleted post ids to filter out deleted posts, etc
export const deletedPostsCache = new Set();

// Manage blocked user ids to filter out posts from them
export const blockedUsersCache = new Set();

// For debugging purposes:
Object.assign(window, { psc: pageStateCache });
