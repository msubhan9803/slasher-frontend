export const UIRouteURL = (
  tab: string,
  search: string,
  key: string,
  sortVal: string,
  navigate: any,
  callNavigate?: boolean,
) => {
  const query = search.length > 0 ? `q=${encodeURIComponent(search)}` : '';
  /* eslint-disable no-nested-ternary */
  const startsWith = key.length > 0 ? search.length > 0 ? `&startsWith=${key.toLowerCase()}` : `startsWith=${key.toLowerCase()}` : '';
  const sortValue = sortVal ? (search.length > 0 || key.length > 0) ? `&sort=${sortVal}` : `sort=${sortVal}` : '';
  if ((search.length > 0 || key.length > 0) && sortVal && callNavigate) {
    navigate(`/app/movies/${tab}?${query}${startsWith}${sortValue}`);
  } else if (search.length === 0 && key.length === 0 && sortVal && callNavigate) {
    navigate(`/app/movies/${tab}?sort=${sortVal}`);
  }
};

export const RouteURL = (
  tab: string,
  search: string,
  key: string,
  sortVal: string,
  navigate: any,
  searchParams: any,
) => {
  if (!searchParams.get('sort')) {
    if (search.length === 0 && key.length === 0 && sortVal && !searchParams.get('q') && !searchParams.get('startsWith')?.toLowerCase()) {
      navigate(`/app/movies/${tab}?sort=${searchParams.get('sort') || sortVal}`);
    } else if (search.length > 0 && key.length > 0 && sortVal) {
      navigate(`/app/movies/${tab}?q=${search}&startsWith=${key}&sort=${sortVal}`);
    } else if (search.length > 0 && sortVal) {
      navigate(`/app/movies/${tab}?q=${search}&sort=${sortVal}`);
    } else if (key.length > 0 && sortVal) {
      navigate(`/app/movies/${tab}?startsWith=${key}&sort=${sortVal}`);
    }
  }
};
