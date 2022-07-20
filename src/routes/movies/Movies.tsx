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
      id: 1, image: 'https://i.pravatar.cc/300?img=19', name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 2, image: 'https://i.pravatar.cc/300?img=13', name: 'The Djinn', year: '2022', liked: false,
    },
    {
      id: 3, image: 'https://i.pravatar.cc/300?img=22', name: 'Ghost Lab', year: '2022', liked: true,
    },
    {
      id: 4, image: 'https://i.pravatar.cc/300?img=11 ', name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 5, image: 'https://i.pravatar.cc/300?img=12', name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 6, image: 'https://i.pravatar.cc/300?img=16', name: 'The Djinn', year: '2022', liked: false,
    },
    {
      id: 7, image: 'https://i.pravatar.cc/300?img=18', name: 'Ghost Lab', year: '2022', liked: true,
    },
    {
      id: 8, image: 'https://i.pravatar.cc/300?img=14', name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 8, image: 'https://i.pravatar.cc/300?img=09', name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 8, image: 'https://i.pravatar.cc/300?img=25', name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
  ];
  const [selectedTab, setSelectedTab] = useState(tabs[0].value);
  const [showKeys, setShowKeys] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState(myMovies);
  return (
    <AuthenticatedPageWrapper rightSidebarType="movie">
      <Container fluid>
        <Row className="justify-content-between align-items-start mb-4">
          <Col className="p-0">
            <h1 className="h4 text-center text-lg-start mb-0">Movies</h1>
          </Col>
        </Row>
        <Row className="bg-dark pb-0 pt-lg-3 rounded-3">
          <Col xs={12}>
            <MoviesSearch setFilteredMovies={setFilteredMovies} myMovies={myMovies} />
            <StyleTabs
              className="justify-content-between flex-nowrap mt-3 border-0"
              onSelect={(e: any) => setSelectedTab(e)}
            >
              {tabs.map(({ value, label }) => (
                <Tab key={value} eventKey={value} title={label} />
              ))}
            </StyleTabs>
          </Col>
        </Row>
        <Row className="my-4 align-items-center">
          <Col md={5} lg={4} className="d-none d-lg-block">
            <MoviesSearch setFilteredMovies={setFilteredMovies} myMovies={myMovies} />
          </Col>
          <Col xs={12} lg={4} className="text-center p-md-0">
            <Row className="flex-md-row-reverse justify-content-between me-0">
              <Col md={4}>
                <RoundButton className="w-100 d-lg-none mb-1">Add your movie</RoundButton>
              </Col>
              <Col md={4} lg={12} className="text-md-start text-lg-center">
                <MoviesFilterOptions setShowKeys={setShowKeys} showKeys={showKeys} />
              </Col>
            </Row>
          </Col>
          <Col md={5} lg={4} className="d-none d-lg-block">
            <MoviesSort title="Sort:" className="rounded-5" />
          </Col>
        </Row>
        {showKeys && (<MoviesFilterComponent showKeys={showKeys} setShowKeys={setShowKeys} />)}
        {selectedTab === 'myMovies' && (
          <MovieCardStyle className="bg-dark rounded-3 py-1 px-2">
            <Row className="my-3 mx-0">
              {filteredMovies.length > 0 ? filteredMovies.map((movieDetail) => (
                <Col xs={4} sm={3} lg={3} key={movieDetail.id}>
                  <MovieCard
                    name={movieDetail.name}
                    image={movieDetail.image}
                    year={movieDetail.year}
                    liked={movieDetail.liked}
                  />
                </Col>
              )) : (
                <h1 className="h4 text-center mb-0">No data found</h1>
              )}
            </Row>
          </MovieCardStyle>
        )}
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default Movies;
