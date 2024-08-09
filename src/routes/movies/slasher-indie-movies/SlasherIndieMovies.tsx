import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import { MoviesProps } from '../components/MovieProps';
import MoviesHeader from '../MoviesHeader';
import { getMovies } from '../../../api/movies';
import { MovieType } from '../../../types';

function SlasherIndieMovies() {
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [searchParams] = useSearchParams();
  const [key, setKey] = useState(searchParams.get('startsWith')?.toLowerCase() || '');
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>([]);
  const [sortVal, setSortVal] = useState(searchParams.get('sort') || 'name');

  const searchData = useCallback(() => {
    let searchResult;

    getMovies(
      search,
      sortVal,
      key.toLowerCase(),
      '',
      MovieType.UserDefined.toString(),
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
  }, [search, key, sortVal]);

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
        selectedKey={key}
        sortVal={sortVal}
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
