import React, { useEffect, useState } from 'react';
import {
  Col, Container, Row, Tab, Tabs,
} from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../components/ui/RoundButton';
import MovieCard from '../../components/movie/MovieCard';
import CustomTabs from '../../components/ui/CustomTabs';
import FilterOptions from '../../components/filter-sort/FilterOptions';
import FilterDialog from '../../components/filter-sort/FilterModal';
import SortData from '../../components/filter-sort/SortData';
import CustomSearchInput from '../../components/ui/CustomSearchInput';

function MovieData() {
  const tabs = [
    { value: 'allMovies', label: 'All movies' },
    { value: 'myMovies', label: 'My movies' },
    { value: 'slasherIndie', label: 'Slasher Indie' },
    { value: 'favoritesList', label: 'Favorites list' },
    { value: 'watchList', label: 'Watch list' },
    { value: 'watchedList', label: 'Watched list' },
    { value: 'buyList', label: 'Buy list' },
  ];
  const myMovies = [
    {
      id: 1, name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 2, name: 'The Djinn', year: '2022', liked: false,
    },
    {
      id: 3, name: 'Ghost Lab', year: '2022', liked: true,
    },
    {
      id: 4, name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 5, name: 'The Exorcist', year: '2022', liked: true,
    },
    {
      id: 6, name: 'Spiral: From the Book of Saw', year: '2022', liked: false,
    },
    {
      id: 7, name: 'The Night House', year: '2022', liked: true,
    },
    {
      id: 8, name: 'Zombie Reddy', year: '2022', liked: true,
    },
  ];
  const [showKeys, setShowKeys] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState(myMovies);
  const [search, setSearch] = useState<string>('');
  const searchData = () => {
    let searchResult;
    const newFilter = myMovies;
    if (search) {
      searchResult = newFilter.filter((src: any) => src.name.toLowerCase().startsWith(search));
      setFilteredMovies(searchResult);
    } else {
      setFilteredMovies(myMovies);
    }
  };
  useEffect(() => { searchData(); }, [search]);
  return (
    <AuthenticatedPageWrapper rightSidebarType="movie">
      <Container fluid>
        <h1 className="d-lg-none h4 text-center">Movies</h1>
        <Row className="bg-dark bg-mobile-transparent rounded-3">
          <Col xs={12}>
            <CustomTabs>
              <Tabs className="border-0 justify-content-between flex-nowrap mt-3">
                {tabs.map(({ value, label }) => (
                  <Tab key={value} eventKey={value} title={label} />
                ))}
              </Tabs>
            </CustomTabs>
          </Col>
        </Row>
        <Row className="my-4 align-items-center">
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
        {showKeys && (<FilterDialog showKeys={showKeys} setShowKeys={setShowKeys} />)}
        <div className="bg-dark bg-mobile-transparent rounded-3 py-1 px-lg-2">
          <Row className="mt-3 mx-lg-0">
            {filteredMovies.length > 0 ? filteredMovies.map((movieDetail) => (
              <Col xs={4} md={3} lg={4} xl={3} key={movieDetail.id}>
                <MovieCard
                  name={movieDetail.name}
                  year={movieDetail.year}
                  liked={movieDetail.liked}
                />
              </Col>
            )) : (
              <h1 className="h4 text-center mb-0">No data found</h1>
            )}
          </Row>
        </div>
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default MovieData;
