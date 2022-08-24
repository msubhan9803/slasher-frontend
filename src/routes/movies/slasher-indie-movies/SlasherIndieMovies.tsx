import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import { slasherIndieMovies } from '../components/MovieList';
import { MoviesProps } from '../components/MovieProps';
import MoviesHeader from '../MoviesHeader';

function SlasherIndieMovies() {
  const navigate = useNavigate();
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>([]);
  const changeTab = (tab: string) => {
    navigate(`/movies/${tab}`);
  };
  const searchData = () => {
    let searchResult;
    const newFilter = slasherIndieMovies;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
        : [];
      setFilteredMovies(searchResult);
    } else {
      setFilteredMovies(slasherIndieMovies);
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <AuthenticatedPageWrapper rightSidebarType="movie">
      <MoviesHeader
        tabKey="slasher-indie"
        changeTab={changeTab}
        showKeys={showKeys}
        setShowKeys={setShowKeys}
        setSearch={setSearch}
        search={search}
      />
      <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 py-lg-4">
        <div className="m-md-2">
          <PosterCardList dataList={filteredMovies} />
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default SlasherIndieMovies;
