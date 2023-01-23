import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import MoviesHeader from '../MoviesHeader';
import { getMovies, getMoviesByFirstName } from '../../../api/movies';
import { MoviesProps } from '../components/MovieProps';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import MovieRightSideNav from '../components/MovieRightSideNav';

function AllMovies() {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [key, setKey] = useState<string>('');
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

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
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
        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
          <div className="m-md-2">
            <InfiniteScroll
              threshold={2000}
              pageStart={0}
              initialLoad
              loadMore={() => { setRequestAdditionalPosts(true); }}
              hasMore={!noMoreData}
              element="span"
            >
              <PosterCardList dataList={filteredMovies} />
            </InfiniteScroll>
            {loadingPosts && <LoadingIndicator />}
            {noMoreData && renderNoMoreDataMessage()}
          </div>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <MovieRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default AllMovies;
