import React, { useCallback, useEffect, useState } from 'react';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import { buyMovieList } from '../components/MovieList';
import { MoviesProps } from '../components/MovieProps';
import MoviesHeader from '../MoviesHeader';
import { MOVIE_BUY_LIST_DIV_ID } from '../../../utils/pubwise-ad-units';

function BuyMovieList() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>(buyMovieList);
  const searchData = useCallback(() => {
    let searchResult;
    const newFilter = buyMovieList;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
        : [];
      setFilteredMovies(searchResult);
    } else {
      setFilteredMovies(buyMovieList);
    }
  }, [search]);
  useEffect(() => {
    searchData();
  }, [search, searchData]);
  return (
    <div>
      <MoviesHeader
        tabKey="buy-list"
        showKeys={showKeys}
        setShowKeys={setShowKeys}
        setSearch={setSearch}
        search={search}
      />
      <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
        <div className="m-md-2">
          <PosterCardList dataList={filteredMovies} pubWiseAdUnitDivId={MOVIE_BUY_LIST_DIV_ID} />
        </div>
      </div>
    </div>
  );
}

export default BuyMovieList;
