import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import MoviesHeader from '../MoviesHeader';
import getMovies, { getMoviesByFirstName } from '../../../api/movies';
import { MoviesProps } from '../components/MovieProps';

function AllMovies() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [key, setKey] = useState<string>('');
  const searchData = () => {
    getMovies(search, '')
      .then((res) => {
        setFilteredMovies(res.data);
      });
  };
  useEffect(() => {
    searchData();
  }, [search]);

  useEffect(() => {
    getMovies()
      .then((res) => {
        setFilteredMovies(res.data);
      });
  }, []);

  const fetchMoreMovies = () => {
    if (filteredMovies && filteredMovies.length > 0) {
      /* eslint no-underscore-dangle: 0 */
      getMovies('', '', filteredMovies[filteredMovies.length - 1]._id)
        .then((res) => {
          setFilteredMovies((prev: any) => [
            ...prev,
            ...res.data,
          ]);
          if (res.data.length === 0) {
            setNoMoreData(true);
          }
        });
    }
  };

  const onShort = (shortValue : string) => {
    getMovies('', shortValue)
      .then((res) => {
        setFilteredMovies(res.data);
      });
  };

  const selectedKey = (keyValue: string) => {
    setKey(keyValue);
  };

  const applyFilter = () => {
    getMoviesByFirstName(key.toLowerCase())
      .then((res) => {
        getMovies(res.data._id)
          .then((result) => {
            setFilteredMovies(result.data);
          });
      });
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="movie">
      <MoviesHeader
        tabKey="all"
        showKeys={showKeys}
        setShowKeys={setShowKeys}
        setSearch={setSearch}
        search={search}
        short={onShort}
        selectedKey={selectedKey}
        applyFilter={applyFilter}
      />
      <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
        <div className="m-md-2">
          <InfiniteScroll
            pageStart={0}
            initialLoad={false}
            loadMore={fetchMoreMovies}
            hasMore={!noMoreData}
            element="span"
          >
            <PosterCardList dataList={filteredMovies} />
          </InfiniteScroll>
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default AllMovies;
