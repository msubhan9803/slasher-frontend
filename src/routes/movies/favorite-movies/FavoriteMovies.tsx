import React, { useEffect, useState } from 'react';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import { MoviesProps } from '../components/MovieProps';
import MoviesHeader from '../MoviesHeader';
import { favoritesMovies } from '../components/MovieList';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import MovieRightSideNav from '../components/MovieRightSideNav';
import ScrollWrapper from '../../../components/ui/ScrollWrapper';

function FavoriteMovies() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>(favoritesMovies);
  const searchData = () => {
    let searchResult;
    const newFilter = favoritesMovies;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
        : [];
      setFilteredMovies(searchResult);
    } else {
      setFilteredMovies(favoritesMovies);
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <MoviesHeader
          tabKey="favorites"
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

export default FavoriteMovies;
