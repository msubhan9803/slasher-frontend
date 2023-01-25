import React, { useEffect, useState } from 'react';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import ScrollWrapper from '../../../components/ui/ScrollWrapper';
import { myMovies } from '../components/MovieList';
import { MoviesProps } from '../components/MovieProps';
import MovieRightSideNav from '../components/MovieRightSideNav';
import MoviesHeader from '../MoviesHeader';

function MyMovies() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>(myMovies);
  const searchData = () => {
    let searchResult;
    const newFilter = myMovies;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
        : [];
      setFilteredMovies(searchResult);
    } else {
      setFilteredMovies(myMovies);
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <MoviesHeader
          tabKey="my-movies"
          showKeys={showKeys}
          setShowKeys={setShowKeys}
          setSearch={setSearch}
          search={search}
        />
        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          <div className="m-md-2">
            <ScrollWrapper>
              <PosterCardList dataList={filteredMovies} />
            </ScrollWrapper>
          </div>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="pb-3 d-none d-lg-block">
        <MovieRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default MyMovies;
