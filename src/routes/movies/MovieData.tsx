import React, { useEffect, useState } from 'react';
import {
  Col, Container, Row,
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../components/ui/RoundButton';
import FilterOptions from '../../components/filter-sort/FilterOptions';
import FilterModal from '../../components/filter-sort/FilterModal';
import SortData from '../../components/filter-sort/SortData';
import CustomSearchInput from '../../components/ui/CustomSearchInput';
import TabLinks from '../../components/tabs/TabLinks';
import PosterCardList from '../../components/tabs/PosterCardList';
import {
  allMovies, buyList, favoritesList, myMovies, slasherIndie, watchedList, watchList,
} from './components/MovieList';

interface MoviesProps {
  id: number,
  name: string,
  image: string,
  year: string,
  liked: boolean,
}
function MovieData() {
  const tabs = [
    { value: 'all', label: 'All movies' },
    { value: 'slasher-indie', label: 'Slasher Indie' },
    { value: 'favorites', label: 'Favorites list' },
    { value: 'watch-list', label: 'Watch list' },
    { value: 'watched-list', label: 'Watched list' },
    { value: 'buy-list', label: 'Buy list' },
    { value: 'my-movies', label: 'My movies' },
  ];
  const [showKeys, setShowKeys] = useState(false);
  const path = useParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<MoviesProps[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<MoviesProps[]>([]);
  const [selectedMovieTab, setSelectedMovieTab] = useState<string>();
  const [search, setSearch] = useState<string>('');
  const searchData = () => {
    let searchResult;
    const newFilter = movies;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search))
        : [];
      setFilteredMovies(searchResult);
    } else {
      setFilteredMovies(movies);
    }
  };
  useEffect(() => {
    searchData();
    if (path && path.id) {
      setSelectedMovieTab(path.id);
    } else {
      setSelectedMovieTab(tabs[0].value);
    }
  }, [search, path]);
  useEffect(() => {
    switch (path.id) {
      case tabs[0].value:
        setMovies(allMovies);
        setFilteredMovies(allMovies);
        break;
      case tabs[1].value:
        setMovies(slasherIndie);
        setFilteredMovies(slasherIndie);
        break;
      case tabs[2].value:
        setMovies(favoritesList);
        setFilteredMovies(favoritesList);
        break;
      case tabs[3].value:
        setMovies(watchList);
        setFilteredMovies(watchList);
        break;
      case tabs[4].value:
        setMovies(watchedList);
        setFilteredMovies(watchedList);
        break;
      case tabs[5].value:
        setMovies(buyList);
        setFilteredMovies(buyList);
        break;
      case tabs[6].value:
        setMovies(myMovies);
        setFilteredMovies(myMovies);
        break;
      default:
        setMovies([]);
        setFilteredMovies([]);
    }
  }, [path]);

  const changeTab = (value: string) => {
    navigate(`/movies/${value}`);
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType="movie">
      <Container fluid>
        <TabLinks tabLink={tabs} setSelectedTab={changeTab} selectedTab={selectedMovieTab} />
        <Row className="mt-3 mb-md-3 align-items-center">
          <Col md={4} className="my-3 my-md-0 order-md-second order-md-first">
            <CustomSearchInput label="Search..." setSearch={setSearch} search={search} />
          </Col>
          <Col md={4} className="text-center">
            <FilterOptions setShowKeys={setShowKeys} showKeys={showKeys} />
          </Col>
          <Col md={4} className="d-none d-lg-block">
            <SortData title="Sort: " className="rounded-5" />
          </Col>
          <Col md={4} className="order-first order-md-last">
            <RoundButton className="py-2 d-lg-none w-100">Add your movie</RoundButton>
          </Col>
        </Row>
        {showKeys && (<FilterModal showKeys={showKeys} setShowKeys={setShowKeys} />)}
        <div className="bg-dark bg-mobile-transparent rounded-3 py-1 px-lg-3">
          <PosterCardList dataList={filteredMovies} />
        </div>
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default MovieData;
