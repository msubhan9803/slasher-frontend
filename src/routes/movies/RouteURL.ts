export const UIRouteURL = (
  search: string,
  key: string,
  sortVal: string,
  navigate: any,
  callNavigate?: boolean,
) => {
  const query = search?.length > 0 ? `q=${encodeURIComponent(search)}` : '';
  /* eslint-disable no-nested-ternary */
  const startsWith = key?.length > 0 ? search?.length > 0 ? `&startsWith=${encodeURIComponent(key.toLowerCase())}` : `startsWith=${encodeURIComponent(key.toLowerCase())}` : '';
  const sortValue = sortVal ? (search?.length > 0 || key?.length > 0) ? `&sort=${sortVal}` : `sort=${sortVal}` : '';
  if ((search?.length > 0 || key?.length > 0) && sortVal && callNavigate) {
    navigate(`?${query}${startsWith}${sortValue}`);
  } else if (search?.length === 0 && key?.length === 0 && sortVal && callNavigate) {
    navigate(`?sort=${sortVal}`);
  }
};
