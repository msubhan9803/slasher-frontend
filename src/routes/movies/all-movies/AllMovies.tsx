import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import MoviesHeader from '../MoviesHeader';
import { allMovies } from '../components/MovieList';
import { MoviesProps } from '../components/MovieProps';

function AllMovies() {
  const navigate = useNavigate();
  const [showKeys, setShowKeys] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>([]);
  const changeTab = (tab: string) => {
    navigate(`/movies/${tab}`);
  };
  const searchData = () => {
    let searchResult;
    const newFilter = allMovies;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
        : [];
      setFilteredMovies(searchResult);
    } else {
      setFilteredMovies(allMovies);
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <AuthenticatedPageWrapper rightSidebarType="movie">
      <MoviesHeader
        tabKey="all"
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

export default AllMovies;
