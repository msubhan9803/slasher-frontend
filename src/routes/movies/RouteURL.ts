const RouteURL = (tab: string, search: string, key: string, sortVal: string, navigate: any) => {
  const query = search.length > 0 ? `q=${encodeURIComponent(search)}` : '';
  /* eslint-disable no-nested-ternary */
  const startsWith = key.length > 0 ? search.length > 0 ? `&startsWith=${key.toLowerCase()}` : `startsWith=${key.toLowerCase()}` : '';
  const sortValue = sortVal ? (search.length > 0 || key.length > 0) ? `&sort=${sortVal}` : `sort=${sortVal}` : '';
  if (search.length > 0 || key.length > 0 || sortVal) {
    navigate(`/app/movies/${tab}?${query}${startsWith}${sortValue}`);
  }
};

export default RouteURL;
