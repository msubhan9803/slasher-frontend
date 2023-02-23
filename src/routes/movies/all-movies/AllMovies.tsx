/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setScrollPosition } from '../../../redux/slices/scrollPositionSlice';
import { RouteURL, UIRouteURL } from '../RouteURL';

function AllMovies() {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [showKeys, setShowKeys] = useState(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [isKeyMoviesReady, setKeyMoviesReady] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>(
    scrollPosition.pathname === location.pathname ? scrollPosition?.data : [],
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [key, setKey] = useState(searchParams.get('startsWith')?.toLowerCase() || '');
  const [sortVal, setSortVal] = useState(searchParams.get('sort') || 'name');
  const [callNavigate, setCallNavigate] = useState<boolean>(false);
  const [lastMovieId, setLastMovieId] = useState(
    ((scrollPosition.pathname === location.pathname) && (scrollPosition.data.length > 0))
      /* eslint-disable no-unsafe-optional-chaining */
      ? (scrollPosition?.data[scrollPosition?.data.length - 1]?._id)
      : '',
  );

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
      || (scrollPosition?.position === 0 && (search.length > 0 || key.length > 0))
      || ((scrollPosition?.sortValue !== sortVal)
        && search.length === 0
        && key.length === 0
        && sortVal)
    ) {
      setFilteredMovies([]);
      setLastMovieId('');
      setRequestAdditionalPosts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortVal, key, callNavigate]);
  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      if (scrollPosition === null
        || scrollPosition?.position === 0
        || filteredMovies.length >= scrollPosition?.data?.length
        || filteredMovies.length === 0
      ) {
        /* eslint no-underscore-dangle: 0 */
        setNoMoreData(false);
        setLoadingPosts(true);
        getMovies(
          search,
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
            } else { setFilteredMovies(res.data); }
            if (res.data.length === 0) {
              setNoMoreData(true);
              setLastMovieId('');
            } else {
              setLastMovieId(res.data[res.data.length - 1]._id);
            }
            const positionData = {
              pathname: '',
              position: 0,
              data: [],
              positionElementId: '',
              sortValue: '',
            };
            dispatch(setScrollPosition(positionData));
          }).catch(
            (error) => {
              setNoMoreData(true);
              setErrorMessage(error.response.data.message);
            },
          ).finally(
            () => { setRequestAdditionalPosts(false); setLoadingPosts(false); },
          );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    requestAdditionalPosts, loadingPosts, search, sortVal, lastMovieId,
    filteredMovies, scrollPosition, dispatch, isKeyMoviesReady,
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
    setKeyMoviesReady(false);
    setLastMovieId('');
    setFilteredMovies([]);
    getMovies(search, sortVal, '')
      .then((result: any) => {
        setFilteredMovies(result.data);
      });
  };

  const persistScrollPosition = (id?: string) => {
    const positionData = {
      pathname: location.pathname,
      position: window.pageYOffset,
      data: filteredMovies,
      positionElementId: id,
      sortValue: sortVal,
    };
    dispatch(setScrollPosition(positionData));
  };

  return (
    <div>
      <MoviesHeader
        tabKey="all"
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
            loadMore={() => { setRequestAdditionalPosts(true); }}
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
