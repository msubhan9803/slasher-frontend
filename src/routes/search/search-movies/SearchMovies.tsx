import React, { useCallback, useEffect, useState } from 'react';
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
  const searchData = useCallback(() => {
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
  }, [search]);
  useEffect(() => {
    searchData();
  }, [search, searchData]);
  return (
    <div>
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
    </div>
  );
}

export default SearchMovies;
