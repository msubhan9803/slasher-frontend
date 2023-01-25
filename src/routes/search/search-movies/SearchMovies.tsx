import React, { useEffect, useState } from 'react';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import SearchHeader from '../SearchHeader';
import { movies } from '../SearchResult';

interface SearchMoviesProps {
  id: number;
  name: string;
  image: string;
  year: string;
  liked: boolean;
}
function SearchMovies() {
  const [search, setSearch] = useState<string>('');
  const [searchMovies, setSearchMovies] = useState<SearchMoviesProps[]>(movies);
  const searchData = () => {
    let searchResult;
    const newFilter = movies;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: SearchMoviesProps) => src.name.toLowerCase().includes(search))
        : [];
      setSearchMovies(searchResult);
    } else {
      setSearchMovies(movies);
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <SearchHeader
          tabKey="movies"
          setSearch={setSearch}
          search={search}
        />
        <div className="rounded-3 px-lg-4 p-3">
          <div className="m-md-2">
            <PosterCardList dataList={searchMovies} />
          </div>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="pb-3 d-none d-lg-block">
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default SearchMovies;
