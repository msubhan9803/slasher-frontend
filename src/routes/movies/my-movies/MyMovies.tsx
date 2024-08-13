import React, { useCallback, useEffect, useState } from 'react';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import { myMovies } from '../components/MovieList';
import { MoviesProps } from '../components/MovieProps';
import MoviesHeader from '../MoviesHeader';
import MainListingWrapper from '../../../components/ui/MyListings/MainListingWrapper';

function MyMovies() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>(myMovies);
  const searchData = useCallback(() => {
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
  }, [search]);
  useEffect(() => {
    searchData();
  }, [search, searchData]);

  return (
    <div>
      <MoviesHeader
        tabKey="my-movies"
        showKeys={showKeys}
        setShowKeys={setShowKeys}
        setSearch={setSearch}
        search={search}
      />
      <MainListingWrapper />

      {/* <PosterCardList dataList={filteredMovies} /> */}
    </div>
  );
}

export default MyMovies;
