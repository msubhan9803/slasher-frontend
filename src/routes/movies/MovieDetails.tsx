import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Container, Row } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import AboutMovie from './components/AboutMovie';
import MovieCasts from './components/MovieCasts';
import MovieComments from './components/MovieComments';
import MovieTrailers from './components/MovieTrailers';
import PlayMovie from './components/PlayMovie';
import MovieOverview from './components/MovieOverview';

function MovieDetails() {
  const movieCasts = [
    { image: 'https://i.pravatar.cc/300?img=19', name: 'Luciana', designation: 'Singer' },
    { image: 'https://i.pravatar.cc/300?img=23', name: 'Patrick R.', designation: 'Director' },
    { image: 'https://i.pravatar.cc/300?img=14', name: 'Gillie Jones', designation: 'Director' },
    { image: 'https://i.pravatar.cc/300?img=21', name: 'AJ Jones', designation: 'Director' },
    { image: 'https://i.pravatar.cc/300?img=11', name: 'Najah Bradley', designation: 'Director' },
    { image: 'https://i.pravatar.cc/300?img=18', name: 'Najah Bley', designation: 'Director' },
  ];
  const movieTrailer = ['ojuqj8_wWo8', 'uOV-xMYQ7sk', 'GZjvNPnIzQg', 'dylgnwNKoYc'];
  return (
    <AuthenticatedPageWrapper rightSidebarType="movie">
      <Container fluid className="mb-5">
        <Row className="d-lg-none justify-content-between align-items-start mb-4">
          <Col md={2} lg={1}>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={solid('arrow-left')} size="lg" className="d-md-none" />
              <h1 className="h4 text-center mb-md-0 mx-auto">Movies</h1>
            </div>
          </Col>
        </Row>
        <PlayMovie embedId="WT_24V6Aids" />
        <AboutMovie />
        <MovieOverview />
        <MovieCasts movieCasts={movieCasts} />
        <MovieTrailers movieTrailer={movieTrailer} />
        <MovieComments />
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default MovieDetails;
