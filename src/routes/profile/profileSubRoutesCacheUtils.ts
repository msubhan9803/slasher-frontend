import { getPageStateCache } from '../../pageStateCache';
import { LocationOrPathname, ProfileSubroutesCache } from '../../types';

export const PROFILE_SUBROUTES_DEFAULT_CACHE: ProfileSubroutesCache = {
  user: null,
  allFriends: { page: 0, data: [], searchValue: '' },
  friendRequests: { page: 0, data: [] },
  profilePosts: [],
};

export const getProfileSubroutesCache = (location: LocationOrPathname) => {
  const profileSubroutesCache = getPageStateCache<ProfileSubroutesCache>(location)
    || PROFILE_SUBROUTES_DEFAULT_CACHE;
  return profileSubroutesCache;
};
