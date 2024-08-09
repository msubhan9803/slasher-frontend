import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import { slasherIndieMovies } from '../components/MovieList';
import { MoviesProps } from '../components/MovieProps';
import MoviesHeader from '../MoviesHeader';
import { getMovies } from '../../../api/movies';

function SlasherIndieMovies() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [searchParams] = useSearchParams();
  const [key, setKey] = useState(searchParams.get('startsWith')?.toLowerCase() || '');
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>(slasherIndieMovies);
  const [sortVal, setSortVal] = useState(searchParams.get('sort') || 'name');
  // const [lastMovieId, setLastMovieId] = useState(
  //   (hasPageStateCache(location) && (pageStateCache.length > 0))
  //     ? (pageStateCache[pageStateCache.length - 1]?._id)
  //     : '',
  // );

  const searchData = useCallback(() => {
    let searchResult;

    // Fetch movies of type UserDefined = 2
    getMovies(
      search,
      sortVal,
      key.toLowerCase(),
      // forceReload ? undefined : (lastMovieId || undefined),
      '',
      '2',
    )
      .then((res) => {
        const newFilter = res.data;
        if (search) {
          searchResult = newFilter && newFilter.length > 0
            ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
            : [];
          setFilteredMovies(searchResult);
        } else {
          setFilteredMovies(res.data);
        }
      });
  }, [search]);

  useEffect(() => {
    searchData();
  }, [search, searchData]);

  return (
    <div>
      <MoviesHeader
        tabKey="slasher-indie"
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

export default SlasherIndieMovies;
