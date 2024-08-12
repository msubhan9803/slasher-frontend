export const generateParamsString = (obj: any) => Object.entries(obj)
  .map(([key, value]) => value && `${key}=${value}`)
  .filter(Boolean)
  .join('&');
