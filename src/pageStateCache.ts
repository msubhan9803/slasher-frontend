import { Location } from 'react-router-dom';

export const getPageName = (location: Location) => `${location.pathname}${location.search}${location.hash}`;

const pageStateCache = new Map<string, any>();

export const hasPageStateCache = (location: Location) => pageStateCache.has(getPageName(location));
export const deletePageStateCache = (location: Location | string) => ((typeof location === 'string') ? pageStateCache.delete(location)
  : pageStateCache.delete(getPageName(location)));
export const getPageStateCache = <T = any>(location: Location | string): T => (typeof location === 'string'
  ? pageStateCache.get(location)
  : pageStateCache.get(getPageName(location)));
export const setPageStateCache = <T>(location: Location | string, data: T) => (typeof location === 'string'
  ? pageStateCache.set(location, data)
  : pageStateCache.set(getPageName(location), data));

// Note to Sahil: Only for debugging (please remove before making PR)
Object.assign(window, { pageStateCache });
