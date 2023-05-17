import { Location } from 'react-router-dom';

const pageStateCache = new Map<string, any>();
// eslint-disable-next-line max-len
export const getPageName = (location: Location) => location.pathname + location.search + location.hash;

export const hasPageStateCache = (location: Location) => pageStateCache.has(getPageName(location));
export const deletePageStateCache = (location: Location | string) => {
  if (typeof location === 'string') {
    pageStateCache.delete(location);
    return;
  }
  pageStateCache.delete(getPageName(location));
};
export const getPageStateCache = (location: Location) => pageStateCache.get(getPageName(location));
export const setPageStateCache = (location: Location | string, data: any) => {
  if (typeof location === 'string') {
    pageStateCache.set(location, data);
    return;
  }
  pageStateCache.set(getPageName(location), data);
};

// Note to Sahil: Only for debugging (please remove before making PR)
Object.assign(window, { pageStateCache });
