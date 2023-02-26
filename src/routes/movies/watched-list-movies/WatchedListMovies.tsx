/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import InfiniteScroll from 'react-infinite-scroller';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import { MoviesProps } from '../components/MovieProps';
import MoviesHeader from '../MoviesHeader';
import { MOVIE_WATCHED_LIST_DIV_ID } from '../../../utils/pubwise-ad-units';
import { getUserMoviesList } from '../../../api/users';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import RoundButton from '../../../components/ui/RoundButton';
import { setScrollPosition } from '../../../redux/slices/scrollPositionSlice';
import { RouteURL, UIRouteURL } from '../RouteURL';

function WatchedListMovies() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [requestAdditionalMovies, setRequestAdditionalMovies] = useState<boolean>(false);
  const [showKeys, setShowKeys] = useState(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [key, setKey] = useState(searchParams.get('startsWith')?.toLowerCase() || '');
  const [isKeyMoviesReady, setKeyMoviesReady] = useState<boolean>(false);
  const [loadingMovies, setLoadingMovies] = useState<boolean>(false);
  const [sortVal, setSortVal] = useState(searchParams.get('sort') || 'name');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>(
    scrollPosition.pathname === location.pathname ? scrollPosition?.data : [],
  );
  const [search, setSearch] = useState<string>(searchParams.get('q') || '');
  const [lastMovieId, setLastMovieId] = useState(
    ((scrollPosition.pathname === location.pathname) && (scrollPosition.data.length > 0))
      /* eslint-disable no-unsafe-optional-chaining */
      ? (scrollPosition?.data[scrollPosition?.data.length - 1]?._id)
      : '',
  );
  const [callNavigate, setCallNavigate] = useState<boolean>(false);
  const userId = Cookies.get('userId');

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setKey(searchParams.get('startsWith')?.toLowerCase() || '');
    setSortVal(searchParams.get('sort') || 'name');
  }, [searchParams]);
  useEffect(() => {
    RouteURL(search, key, sortVal, navigate, searchParams);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [search, key, sortVal]);
  useEffect(() => {
    UIRouteURL(search, key, sortVal, navigate, callNavigate);
    setCallNavigate(false);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [callNavigate]);
  useEffect(() => {
    if (callNavigate
      || (scrollPosition?.position === 0 && (search.length === 0 || key.length === 0))
      || ((scrollPosition?.sortValue !== sortVal)
        && ((scrollPosition?.searchValue === '' && scrollPosition?.keyValue === '')
          || (scrollPosition?.searchValue !== search && scrollPosition?.keyValue !== key)
          || (search.length === 0 || key.length === 0) || (search.length > 0 || key.length > 0))
        && sortVal)
      || (search === '' && key === '' && sortVal === 'name' && scrollPosition.position === 0)
      || ((scrollPosition?.searchValue !== search || scrollPosition?.keyValue !== key) && sortVal === 'name')
    ) {
      setFilteredMovies([]);
      setLastMovieId('');
      setRequestAdditionalMovies(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortVal, key, callNavigate]);

  useEffect(() => {
    if (requestAdditionalMovies && !loadingMovies && userId) {
      if (scrollPosition === null
        || scrollPosition?.position === 0
        || filteredMovies.length >= scrollPosition?.data?.length
        || filteredMovies.length === 0
      ) {
        /* eslint no-underscore-dangle: 0 */
        setNoMoreData(false);
        setLoadingMovies(true);
        getUserMoviesList(
          'watched-list',
          search,
          userId,
          sortVal,
          key.toLowerCase(),
          lastMovieId.length > 0 ? lastMovieId : undefined,
        )
          .then((res) => {
            if (lastMovieId) {
              setFilteredMovies((prev: MoviesProps[]) => [
                ...prev,
                ...res.data,
              ]);
            } else {
              setFilteredMovies(res.data);
            }
            if (res.data.length === 0) {
              setNoMoreData(true);
              setLastMovieId('');
            } else {
              setLastMovieId(res.data[res.data.length - 1]._id);
            }
            if (res.data.length === 0) { setNoMoreData(true); }
            const positionData = {
              pathname: '',
              position: 0,
              data: [],
              id: '',
              sortValue: '',
              searchValue: '',
              keyValue: '',
            };
            dispatch(setScrollPosition(positionData));
          }).catch(
            (error) => {
              setNoMoreData(true);
              setErrorMessage(error.response.data.message);
            },
          ).finally(
            () => { setRequestAdditionalMovies(false); setLoadingMovies(false); },
          );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    requestAdditionalMovies, loadingMovies, search, sortVal, lastMovieId,
    filteredMovies, scrollPosition, dispatch, userId, isKeyMoviesReady,
  ]);

  const applyFilter = (keyValue: string, sortValue?: string) => {
    setCallNavigate(true);
    setKey(keyValue.toLowerCase());
    if (sortValue) { setSortVal(sortValue); }
  };
  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        filteredMovies.length === 0
          ? 'No Movies available'
          : 'No more Movies'
      }
    </p>
  );

  const clearKeyHandler = () => {
    setKey('');
    setCallNavigate(true);
    setLastMovieId('');
    setKeyMoviesReady(false);
    setFilteredMovies([]);
    if (userId) {
      getUserMoviesList('watched-list', search, userId, sortVal, '')
        .then((result: any) => {
          setFilteredMovies(result.data);
        });
    }
  };

  const persistScrollPosition = (id?: string) => {
    const positionData = {
      pathname: location.pathname,
      position: window.pageYOffset === 0 ? 1 : window.pageYOffset,
      data: filteredMovies,
      positionElementId: id,
      sortValue: sortVal,
      searchValue: search,
      keyValue: key,
    };
    dispatch(setScrollPosition(positionData));
  };
  return (
    <div>
      <MoviesHeader
        tabKey="watched-list"
        showKeys={showKeys}
        setShowKeys={setShowKeys}
        setSearch={(query: string) => { setSearch(query); setCallNavigate(true); }}
        search={search}
        sort={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setSortVal(e.target.value);
          setCallNavigate(true);
        }}
        selectedKey={key}
        applyFilter={applyFilter}
        sortVal={sortVal}
      />
      {key !== '' && (isKeyMoviesReady || scrollPosition.data.length <= filteredMovies.length)
        && (
          <div className="w-100 d-flex justify-content-center mb-3">
            <RoundButton size="sm" variant="filter" className="px-3" onClick={clearKeyHandler}>
              Starts with
              {' '}
              {key.toUpperCase()}
              {' '}
              <FontAwesomeIcon icon={solid('x')} size="sm" />
            </RoundButton>
          </div>
        )}
      <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
        <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
        <div className="m-md-2">
          <InfiniteScroll
            threshold={2000}
            pageStart={0}
            initialLoad
            loadMore={() => { setRequestAdditionalMovies(true); }}
            hasMore={!noMoreData}
          >
            <PosterCardList
              dataList={filteredMovies}
              pubWiseAdUnitDivId={MOVIE_WATCHED_LIST_DIV_ID}
              onSelect={persistScrollPosition}
            />
          </InfiniteScroll>
          {loadingMovies && <LoadingIndicator />}
          {noMoreData && renderNoMoreDataMessage()}
        </div>
      </div>
    </div>
  );
}

export default WatchedListMovies;
