/* eslint-disable max-lines */
import React, { useEffect, useRef, useState } from 'react';
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
import { UIRouteURL } from '../RouteURL';
import { getPageStateCache, hasPageStateCache, setPageStateCache } from '../../../pageStateCache';

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
  const dispatch = useAppDispatch();
  const location = useLocation();
  const pageStateCache = getPageStateCache(location) ?? [];
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>(
    hasPageStateCache(location) ? pageStateCache : [],
  );
  const [search, setSearch] = useState<string>(searchParams.get('q') || '');
  const [lastMovieId, setLastMovieId] = useState(
    ((hasPageStateCache(location)) && (pageStateCache.length > 0))
      /* eslint-disable no-unsafe-optional-chaining */
      ? (pageStateCache[pageStateCache.length - 1]?._id)
      : '',
  );
  const [callNavigate, setCallNavigate] = useState<boolean>(false);
  const userId = useAppSelector((state) => state.user.user.id);
  const prevSearchRef = useRef(search);
  const prevKeyRef = useRef(key);
  const prevSortValRef = useRef(sortVal);

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setKey(searchParams.get('startsWith')?.toLowerCase() || '');
    setSortVal(searchParams.get('sort') || 'name');
  }, [searchParams]);
  useEffect(() => {
    UIRouteURL(search, key, sortVal, navigate, callNavigate);
    setCallNavigate(false);
  }, [search, key, sortVal, navigate, callNavigate]);
  useEffect(() => {
    if (
      callNavigate
      || search !== prevSearchRef.current
      || key !== prevKeyRef.current
      || sortVal !== prevSortValRef.current
    ) {
      setFilteredMovies([]);
      setLastMovieId('');
      setRequestAdditionalMovies(true);
    }
    prevSearchRef.current = search;
    prevKeyRef.current = key;
    prevSortValRef.current = sortVal;
  }, [callNavigate, search, key, sortVal]);

  useEffect(() => {
    if (requestAdditionalMovies && !loadingMovies && userId) {
      if (!hasPageStateCache(location)
        || filteredMovies.length >= pageStateCache?.length
        || filteredMovies.length === 0
      ) {
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
  }, [requestAdditionalMovies, loadingMovies, search, sortVal, lastMovieId, filteredMovies,
    dispatch, userId, isKeyMoviesReady, key, location, pageStateCache?.length,
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

  const persistScrollPosition = () => { setPageStateCache(location, filteredMovies); };

  return (
    <div>
      <MoviesHeader
        tabKey="watched-list"
        showKeys={showKeys}
        setShowKeys={setShowKeys}
        setSearch={(query: string) => { setSearch(query); setCallNavigate(true); }}
        search={search}
        sort={(value: string) => {
          setSortVal(value);
          setCallNavigate(true);
        }}
        selectedKey={key}
        applyFilter={applyFilter}
        sortVal={sortVal}
      />
      {key !== '' && (isKeyMoviesReady || pageStateCache.length <= filteredMovies.length)
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
            threshold={3000}
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
