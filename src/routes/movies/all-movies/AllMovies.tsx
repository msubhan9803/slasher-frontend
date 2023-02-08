import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import MoviesHeader from '../MoviesHeader';
import { getMovies, getMoviesByFirstName } from '../../../api/movies';
import { MoviesProps } from '../components/MovieProps';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { ALL_MOVIES_DIV_ID } from '../../../utils/pubwise-ad-units';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import RoundButton from '../../../components/ui/RoundButton';

function AllMovies() {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [key, setKey] = useState<string>('');
  const [isKeyMoviesReady, setKeyMoviesReady] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [sortVal, setSortVal] = useState<string>('name');
  const [errorMessage, setErrorMessage] = useState<string[]>();

  useEffect(() => {
    setFilteredMovies([]);
    setRequestAdditionalPosts(true);
  }, [search, sortVal]);

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
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
        }).catch(
          (error) => {
            setNoMoreData(true);
            setErrorMessage(error.response.data.message);
          },
        ).finally(
          () => { setRequestAdditionalPosts(false); setLoadingPosts(false); },
        );
    }
  }, [requestAdditionalPosts, loadingPosts, search, sortVal]);

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
            <PosterCardList dataList={filteredMovies} pubWiseAdUnitDivId={ALL_MOVIES_DIV_ID} />
          </InfiniteScroll>
          {loadingPosts && <LoadingIndicator />}
          {noMoreData && renderNoMoreDataMessage()}
        </div>
      </div>
    </div>
  );
}

export default AllMovies;
