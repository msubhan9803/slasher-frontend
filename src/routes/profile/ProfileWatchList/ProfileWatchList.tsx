/* eslint-disable max-lines */
import React, { useEffect, useRef, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InfiniteScroll from 'react-infinite-scroller';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import ProfileHeader from '../ProfileHeader';
import { User } from '../../../types';
import { ALL_MOVIES_DIV_ID } from '../../../utils/pubwise-ad-units';
import MoviesHeader from '../../movies/MoviesHeader';
import { getUserMoviesList } from '../../../api/users';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import RoundButton from '../../../components/ui/RoundButton';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { setScrollPosition } from '../../../redux/slices/scrollPositionSlice';
import { MoviesProps } from '../../movies/components/MovieProps';
import { UIRouteURL } from '../../movies/RouteURL';
import ProfileTabContent from '../../../components/ui/profile/ProfileTabContent';

interface Props {
  user: User
}
function ProfileWatchList({ user }: Props) {
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
  const [callNavigate, setCallNavigate] = useState<boolean>(false);
  const [search, setSearch] = useState<string>(searchParams.get('q') || '');
  const [lastMovieId, setLastMovieId] = useState(
    ((scrollPosition.pathname === location.pathname) && (scrollPosition.data.length > 0))
      /* eslint-disable no-unsafe-optional-chaining */
      ? (scrollPosition?.data[scrollPosition?.data.length - 1]?._id)
      : '',
  );
  const prevSearchRef = useRef(search);
  const prevKeyRef = useRef(key);
  const prevSortValRef = useRef(sortVal);
  const isLoadingRef = useRef(true);

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
    if (requestAdditionalMovies && !loadingMovies && user._id) {
      if (scrollPosition === null
        || scrollPosition?.position === 0
        || filteredMovies.length >= scrollPosition?.data?.length
        || filteredMovies.length === 0
      ) {
        setNoMoreData(false);
        setLoadingMovies(true);
        getUserMoviesList(
          'watched-list',
          search,
          user._id,
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
            // eslint-disable-next-line max-len
            () => { setRequestAdditionalMovies(false); setLoadingMovies(false); isLoadingRef.current = false; },
          );
      }
    }
  }, [
    requestAdditionalMovies, loadingMovies, search, sortVal, lastMovieId,
    filteredMovies, scrollPosition, dispatch, user._id, isKeyMoviesReady, key,
  ]);
  const applyFilter = (keyValue: string, sortValue?: string) => {
    setCallNavigate(true);
    setKey(keyValue.toLowerCase());
    if (sortValue) { setSortVal(sortValue); }
  };
  const renderNoMoreDataMessage = () => (
    <p className="text-center m-0 py-3">
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
    if (user && user._id) {
      getUserMoviesList('watched-list', search, user._id, sortVal, '')
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
      <ProfileHeader tabKey="watched-list" user={user} />
      <ProfileTabContent>
        <MoviesHeader
          tabKey="watched-list"
          showKeys={showKeys}
          setShowKeys={setShowKeys}
          setSearch={(query: string) => { setSearch(query); setCallNavigate(true); }}
          search={search}
          showMovieTab={false}
          sort={(value: string) => {
            setSortVal(value);
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
        <div className="bg-dark bg-mobile-transparent rounded-3 py-3">
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
            {loadingMovies && <LoadingIndicator />}
            {(isLoadingRef.current || noMoreData) && renderNoMoreDataMessage()}
          </div>
        </div>
      </ProfileTabContent>
    </div>
  );
}

export default ProfileWatchList;
