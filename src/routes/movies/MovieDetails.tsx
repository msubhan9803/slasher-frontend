import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import AboutMovie from './components/AboutMovie';
import MovieCasts from './components/MovieCasts';
import MovieComments from './components/MovieComments';
import MovieTrailers from './components/MovieTrailers';
import PlayMovie from './components/PlayMovie';

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
        <Row className="justify-content-between align-items-start mb-4">
          <Col md={2} lg={1}>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={solid('arrow-left')} size="lg" className="d-md-none" />
              <h1 className="h4 text-center mb-md-0 mx-auto">Movies</h1>
            </div>
          </Col>
        </Row>
        <PlayMovie embedId="WT_24V6Aids" />
        <AboutMovie />
        <div className="bg-dark p-3 rounded-2">
          <h1 className="h3">Overview</h1>
          <small className="m-0 text-light">
            Contrary to popular belief, Lorem Ipsum is not simply random text.
            It has roots in a piece of classical Latin literature from 45 BC, making
            it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney
            College in Virginia, looked up one of the more obscure Latin words, consectetur,
            from a Lorem Ipsum passage, and going through the cites of the word in classical
            literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32
            and 1.10.33 of &#34;de Finibus Bonorum et Malorum&#34; (The Extremes of Good and Evil)
            by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very
            popular during the Renaissance. The first line of Lorem Ipsum, &#34;Lorem ipsum dolor
            sit amet..&#34;, comes from a line in section 1.10.32. The standard chunk of Lorem
            Ipsum used since the 1500s is reproduced below for those interested. Sections
            1.10.32 and 1.10.33 from &#34;de Finibus Bonorum et Malorum&#34; by Cicero are
            also reproduced in their exact original form, accompanied by English versions
            from the 1914 translation by H. Rackham.
          </small>
        </div>
        <div className="bg-dark p-3 rounded-2 mt-3">
          <h1 className="h3">Top billed cast</h1>
          <MovieCasts movieCasts={movieCasts} />
        </div>
        <div className="bg-dark p-3 rounded-2 mt-3">
          <h1 className="h3">Trailers</h1>
          <MovieTrailers movieTrailer={movieTrailer} />
        </div>
        <div className="bg-dark p-3 rounded-2 mt-3">
          <MovieComments />
        </div>
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default MovieDetails;
