import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useLocation } from 'react-router-dom';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import MoviesHeader from '../MoviesHeader';
import { getMovies, getMoviesByFirstName } from '../../../api/movies';
import { MoviesProps } from '../components/MovieProps';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { ALL_MOVIES_DIV_ID } from '../../../utils/pubwise-ad-units';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import RoundButton from '../../../components/ui/RoundButton';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setScrollPosition } from '../../../redux/slices/scrollPositionSlice';

function AllMovies() {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [showKeys, setShowKeys] = useState(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [key, setKey] = useState<string>('');
  const [isKeyMoviesReady, setKeyMoviesReady] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [sortVal, setSortVal] = useState<string>('name');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>(
    scrollPosition.pathname === location.pathname ? scrollPosition?.data : [],
  );
  const [search, setSearch] = useState<string>(scrollPosition.searchValue);

  useEffect(() => {
    if (scrollPosition.searchValue !== search) {
      setFilteredMovies([]);
      setRequestAdditionalPosts(true);
    } else if (!scrollPosition.data.length && !search) {
      setFilteredMovies([]);
      setRequestAdditionalPosts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortVal]);

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
          filteredMovies.length > 0 ? filteredMovies[filteredMovies.length - 1]._id : undefined,
        )
          .then((res) => {
            setFilteredMovies((prev: MoviesProps[]) => [
              ...prev,
              ...res.data,
            ]);
            if (res.data.length === 0) { setNoMoreData(true); }
            const positionData = {
              pathname: '',
              position: 0,
              data: [],
              id: '',
              searchValue: '',
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
  }, [
    requestAdditionalPosts, loadingPosts, search, sortVal,
    filteredMovies, scrollPosition, dispatch,
  ]);

  const applyFilter = () => {
    getMoviesByFirstName(key.toLowerCase())
      .then((res) => {
        getMovies(search, sortVal, res.data._id)
          .then((result) => {
            setFilteredMovies(result.data);
            setKeyMoviesReady(true);
          });
      });
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
    setKeyMoviesReady(false);
    getMovies(search, sortVal)
      .then((result: any) => {
        setFilteredMovies(result.data);
      });
  };

  const persistScrollPosition = () => {
    const positionData = {
      pathname: location.pathname,
      position: window.pageYOffset,
      data: filteredMovies,
      id: '',
      searchValue: search,
    };
    dispatch(setScrollPosition(positionData));
  };
  return (
    <div>
      <MoviesHeader
        tabKey="all"
        showKeys={showKeys}
        setShowKeys={setShowKeys}
        setSearch={setSearch}
        search={search}
        sort={(e: React.ChangeEvent<HTMLSelectElement>) => setSortVal(e.target.value)}
        selectedKey={(keyValue: string) => setKey(keyValue)}
        applyFilter={applyFilter}
      />
      {key !== '' && isKeyMoviesReady
        && (
          <div className="w-100 d-flex justify-content-center mb-3">
            <RoundButton size="sm" variant="filter" className="px-3" onClick={clearKeyHandler}>
              Starts with
              {' '}
              {key}
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
