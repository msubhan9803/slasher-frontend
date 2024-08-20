import { getPageStateCache } from '../../pageStateCache';
import { BusinessListingSubroutesCache, LocationOrPathname } from '../../types';

export const PROFILE_SUBROUTES_DEFAULT_CACHE: BusinessListingSubroutesCache = {
  listingPosts: [],
};

export const getBusinessListingSubroutesCache = (location: LocationOrPathname) => {
  const businessListingSubroutesCache = getPageStateCache<BusinessListingSubroutesCache>(location)
    || PROFILE_SUBROUTES_DEFAULT_CACHE;
  return businessListingSubroutesCache;
};
