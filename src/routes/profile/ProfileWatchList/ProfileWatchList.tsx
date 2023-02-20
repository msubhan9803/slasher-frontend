import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InfiniteScroll from 'react-infinite-scroller';
import { useLocation } from 'react-router-dom';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import ProfileHeader from '../ProfileHeader';
import { User } from '../../../types';
import { ALL_MOVIES_DIV_ID } from '../../../utils/pubwise-ad-units';
import MoviesHeader from '../../movies/MoviesHeader';
import { getUserWatchedList } from '../../../api/users';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import RoundButton from '../../../components/ui/RoundButton';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { setScrollPosition } from '../../../redux/slices/scrollPositionSlice';
import { MoviesProps } from '../../movies/components/MovieProps';

interface Props {
  user: User
}
function ProfileWatchList({ user }: Props) {
  const [requestAdditionalMovies, setRequestAdditionalMovies] = useState<boolean>(false);
  const [showKeys, setShowKeys] = useState(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [key, setKey] = useState<string>('');
  const [isKeyMoviesReady, setKeyMoviesReady] = useState<boolean>(false);
  const [loadingMovies, setLoadingMovies] = useState<boolean>(false);
  const [sortVal, setSortVal] = useState<string>('name');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>(
    scrollPosition.pathname === location.pathname ? scrollPosition?.data : [],
  );
  const [search, setSearch] = useState<string>(scrollPosition.searchValue);
  const [isKeyFilter, setkeyFilter] = useState<boolean>(false);

  useEffect(() => {
    if (scrollPosition.searchValue !== search) {
      setFilteredMovies([]);
      setRequestAdditionalMovies(true);
    } else if (!scrollPosition.data.length && !search) {
      setFilteredMovies([]);
      setRequestAdditionalMovies(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortVal]);

  useEffect(() => {
    if (requestAdditionalMovies && !loadingMovies && user._id) {
      if (scrollPosition === null
        || scrollPosition?.position === 0
        || filteredMovies.length >= scrollPosition?.data?.length
        || filteredMovies.length === 0
      ) {
        /* eslint no-underscore-dangle: 0 */
        setNoMoreData(false);
        setLoadingMovies(true);
        getUserWatchedList(
          'watched-list',
          search,
          user._id,
          sortVal,
          key.toLowerCase(),
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
            () => { setRequestAdditionalMovies(false); setLoadingMovies(false); },
          );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    requestAdditionalMovies, loadingMovies, search, sortVal,
    filteredMovies, scrollPosition, dispatch, user._id, isKeyFilter,
  ]);

  const applyFilter = () => {
    setkeyFilter(true);
    setRequestAdditionalMovies(true);
    setLoadingMovies(false);
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
    if (user && user._id) {
      getUserWatchedList('watched-list', search, user._id, sortVal, key)
        .then((result: any) => {
          setFilteredMovies(result.data);
        });
    }
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
      <ProfileHeader tabKey="watched-list" user={user} />
      <div>
        <MoviesHeader
          tabKey="watched-list"
          showKeys={showKeys}
          setShowKeys={setShowKeys}
          setSearch={setSearch}
          search={search}
          showMovieTab={false}
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
              loadMore={() => { setRequestAdditionalMovies(true); }}
              hasMore={!noMoreData}
            >
              <PosterCardList
                dataList={filteredMovies}
                pubWiseAdUnitDivId={ALL_MOVIES_DIV_ID}
                onSelect={persistScrollPosition}
              />
            </InfiniteScroll>
            {loadingMovies && <LoadingIndicator />}
            {noMoreData && renderNoMoreDataMessage()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileWatchList;
