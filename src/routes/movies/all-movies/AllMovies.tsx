import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import MoviesHeader from '../MoviesHeader';
import getMovies from '../../../api/movies';

function AllMovies() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<any>('');
  const [filteredMovies, setFilteredMovies] = useState<any[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const searchData = () => {
    // let searchResult;
    // const newFilter = allMovies;
    // if (search) {
    //   searchResult = newFilter && newFilter.length > 0
    //     ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
    //     : [];
    //   setFilteredMovies(searchResult);
    // } else {
    //   setFilteredMovies(allMovies);
    // }
    getMovies(null, search)
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
    // if (eventsList && eventsList.length > 0) {
    //   getEvents(startDate, endDate, eventsList[eventsList.length - 1]._id)
    //     .then((res) => {
    //       setEventList((prev: any) => [
    //         ...prev,
    //         ...eventsFromResponse(res),
    //       ]);
    //       if (res.data.length === 0) {
    //         setNoMoreData(true);
    //       }
    //     })
    //     .catch(() => { });
    // }

    if (filteredMovies && filteredMovies.length > 0) {
      /* eslint no-underscore-dangle: 0 */
      getMovies(filteredMovies[filteredMovies.length - 1]._id)
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

  const onShort = (e : any) => {
    getMovies(null, '', e)
      .then((res) => {
        setFilteredMovies(res.data);
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
