import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import AboutMovie from './components/AboutMovie';
import MovieCasts from './components/MovieCasts';
import MovieComments from './components/MovieComments';
import MovieTrailers from './components/MovieTrailers';
import PlayMovie from './components/PlayMovie';
import MovieOverview from './components/MovieOverview';
import RoundButton from '../../components/ui/RoundButton';
import MovieEdit from './components/MovieEdit';

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
  const [selectedScreen, setSelectedScreen] = useState('details');
  return (
    <AuthenticatedPageWrapper rightSidebarType="movie">
      <Container fluid className="mb-5">
        <FontAwesomeIcon icon={solid('arrow-left')} className="d-lg-none mb-2" size="lg" />
        <RoundButton className="d-lg-none w-100 my-3 fs-4">Add your movie</RoundButton>
        <PlayMovie embedId="WT_24V6Aids" />
        <AboutMovie setSelectedScreen={setSelectedScreen} />

        {selectedScreen === 'details' && (
          <>
            <MovieOverview />
            <MovieCasts movieCasts={movieCasts} />
            <MovieTrailers movieTrailer={movieTrailer} />
            <MovieComments />
          </>
        )}
        {selectedScreen === 'edit' && <MovieEdit />}

      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default MovieDetails;
