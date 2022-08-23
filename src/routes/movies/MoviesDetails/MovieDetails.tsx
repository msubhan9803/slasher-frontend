import React from 'react';
import { Container } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import AboutMovie from './AboutMovie';
import PlayMovie from './PlayMovie';
import RoundButton from '../../../components/ui/RoundButton';

function MovieDetails() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="movie">
      <Container fluid className="mb-5">
        <RoundButton className="d-lg-none w-100 my-3 fs-4">Add your movie</RoundButton>
        <PlayMovie embedId="WT_24V6Aids" />
        <AboutMovie />
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default MovieDetails;
