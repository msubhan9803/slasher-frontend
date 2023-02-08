import React, { useEffect, useState } from 'react';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import { myMovies } from '../components/MovieList';
import { MoviesProps } from '../components/MovieProps';
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
    <div>
      <MoviesHeader
        tabKey="my-movies"
        showKeys={showKeys}
        setShowKeys={setShowKeys}
        setSearch={setSearch}
        search={search}
      />
      <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
        <div className="m-md-2">
          <PosterCardList dataList={filteredMovies} />
        </div>
      </div>
    </div>
  );
}

export default MyMovies;
