/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import MoviesHeader from '../MoviesHeader';
import { getMovies } from '../../../api/movies';
import { MoviesProps } from '../components/MovieProps';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { ALL_MOVIES_DIV_ID } from '../../../utils/pubwise-ad-units';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import RoundButton from '../../../components/ui/RoundButton';
import { useAppDispatch } from '../../../redux/hooks';
import { UIRouteURL } from '../RouteURL';
import {
  deletePageStateCache, getPageStateCache, hasPageStateCache, setPageStateCache,
} from '../../../pageStateCache';

function AllMovies() {
  const [requestAdditionalMovies, setRequestAdditionalMovies] = useState<boolean>(false);
  const [showKeys, setShowKeys] = useState(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [isKeyMoviesReady, setKeyMoviesReady] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const pageStateCache = getPageStateCache(location) ?? [];
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>(
    hasPageStateCache(location) ? pageStateCache : [],
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [key, setKey] = useState(searchParams.get('startsWith')?.toLowerCase() || '');
  const [sortVal, setSortVal] = useState(searchParams.get('sort') || 'name');
  const [callNavigate, setCallNavigate] = useState<boolean>(false);
  const [lastMovieId, setLastMovieId] = useState(
    (hasPageStateCache(location) && (pageStateCache.length > 0))
      ? (pageStateCache[pageStateCache.length - 1]?._id)
      : '',
  );
  const prevSearchRef = useRef(search);
  const prevKeyRef = useRef(key);
  const prevSortValRef = useRef(sortVal);
  const lastLocationKeyRef = useRef(location.key);

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

  const fetchMovies = useCallback((forceReload = false) => {
    if (forceReload) { setFilteredMovies([]); }
    setNoMoreData(false);
    setLoadingPosts(true);
    getMovies(
      search,
      sortVal,
      key.toLowerCase(),
      forceReload ? undefined : (lastMovieId || undefined),
    )
      .then((res) => {
        if (lastMovieId) {
          setFilteredMovies((prev: MoviesProps[]) => [
            ...(forceReload ? [] : prev),
            ...res.data,
          ]);
        } else { setFilteredMovies(res.data); }
        if (res.data.length === 0) {
          setNoMoreData(true);
          setLastMovieId('');
        } else {
          setLastMovieId(res.data[res.data.length - 1]._id);
        }
        deletePageStateCache(location);
      }).catch(
        (error) => {
          setNoMoreData(true);
          setErrorMessage(error.response.data.message);
        },
      ).finally(
        () => { setRequestAdditionalMovies(false); setLoadingPosts(false); },
      );
  }, [key, lastMovieId, location, search, sortVal]);

  useEffect(() => {
    if (requestAdditionalMovies && !loadingPosts) {
      if (!hasPageStateCache(location)
        || filteredMovies.length >= pageStateCache?.length
        || filteredMovies.length === 0
      ) {
        fetchMovies();
      }
    }
  }, [requestAdditionalMovies, loadingPosts, search, sortVal, lastMovieId, filteredMovies,
    dispatch, isKeyMoviesReady, key, location, pageStateCache?.length, fetchMovies]);

  useEffect(() => {
    if (requestAdditionalMovies && noMoreData) {
      const isSameKey = lastLocationKeyRef.current === location.key;
      if (isSameKey) { return; }
      // Fetch movies when we click the `movies` in left-side-navbar
      fetchMovies(true);
      // Update lastLocation
      lastLocationKeyRef.current = location.key;
    }
  }, [fetchMovies, location.key, noMoreData, requestAdditionalMovies]);

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
    setKeyMoviesReady(false);
    setLastMovieId('');
    setFilteredMovies([]);
    getMovies(search, sortVal, '')
      .then((result: any) => {
        setFilteredMovies(result.data);
      });
  };

  const persistScrollPosition = () => { setPageStateCache(location, filteredMovies); };

  return (
    <div>
      <MoviesHeader
        tabKey="all"
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
              pubWiseAdUnitDivId={ALL_MOVIES_DIV_ID}
              onSelect={persistScrollPosition}
            />
          </InfiniteScroll>
          {loadingPosts && <LoadingIndicator />}
          {noMoreData && renderNoMoreDataMessage()}
        </div>
      </div>
    </div>
  );
}

export default AllMovies;
