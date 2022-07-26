import React, { useState } from 'react';
import {
  Col, Container, Row, Tab, Tabs,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../components/ui/RoundButton';
import MoviesFilterOptions from './components/MoviesFilterOptions';
import MoviesSearch from './components/MoviesSearch';
import MoviesSort from './components/MoviesSort';
import MoviesFilterComponent from './components/MoviesFilterComponent';
import MovieCard from '../../components/movie/MovieCard';

const StyleTabs = styled(Tabs)`
  overflow-x: auto;
  overflow-y: hidden;
  .nav-link {
    padding-bottom: 1rem;
    border: none;
    color: #ffffff;
    &:hover {
      border-color: transparent;
      color: var(--bs-primary);
    }
    &.active {
      color: var(--bs-primary);
      background-color: transparent;
      border-bottom:  0.188rem solid var(--bs-primary);
    }
  }
`;
const MovieCardStyle = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 110vh;
`;

function Movies() {
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
      id: 5, name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 6, name: 'The Djinn', year: '2022', liked: false,
    },
    {
      id: 7, name: 'Ghost Lab', year: '2022', liked: true,
    },
    {
      id: 8, name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 9, name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 10, name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
  ];
  const [showKeys, setShowKeys] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState(myMovies);
  return (
    <AuthenticatedPageWrapper rightSidebarType="movie">
      <Container fluid>
        <h1 className="d-lg-none h4 text-center">Movies</h1>
        <Row className="bg-dark rounded-3">
          <Col xs={12}>
            <StyleTabs
              className="justify-content-between flex-nowrap mt-3 border-0"
            >
              {tabs.map(({ value, label }) => (
                <Tab key={value} eventKey={value} title={label} />
              ))}
            </StyleTabs>
          </Col>
        </Row>
        <Row className="my-4 align-items-center">
          <Col md={4} className="my-3 my-md-0 order-md-second order-md-first">
            <MoviesSearch setFilteredMovies={setFilteredMovies} myMovies={myMovies} />
          </Col>
          <Col md={4} className="text-center">
            <MoviesFilterOptions setShowKeys={setShowKeys} showKeys={showKeys} />
          </Col>
          <Col md={4} className="d-none d-lg-block">
            <MoviesSort title="Sort: " className="rounded-5" />
          </Col>
          <Col md={4} className="order-first order-md-last">
            <RoundButton className="py-2 d-lg-none text-black fw-bold fs-6 w-100">Add your movie</RoundButton>
          </Col>
        </Row>
        {showKeys && (<MoviesFilterComponent showKeys={showKeys} setShowKeys={setShowKeys} />)}
        <MovieCardStyle className="bg-dark rounded-3 py-1 px-2">
          <Row className="my-3 mx-0">
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
        </MovieCardStyle>
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default Movies;
