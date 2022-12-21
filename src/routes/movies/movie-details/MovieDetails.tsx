import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PlayMovie from './PlayMovie';
import RoundButton from '../../../components/ui/RoundButton';
import AboutMovie from './AboutMovie';
import { getMoviesById, getMoviesDataById } from '../../../api/movies';
import { AdditionalMovieData } from '../../../types';

interface MovieData {
  movieDBId: number;
}

function MovieDetails() {
  const params = useParams();
  const [movieData, setMovieData] = useState<MovieData>();
  const [additionalMovieData, setAdditionalMovieData] = useState<AdditionalMovieData>();
  useEffect(() => {
    if (params.id) {
      getMoviesById(params.id)
        .then((res) => setMovieData(res.data));
    }
  }, [params]);
  useEffect(() => {
    if (movieData && movieData.movieDBId) {
      getMoviesDataById(movieData.movieDBId)
        .then((res) => setAdditionalMovieData(res.data));
    }
  }, [movieData]);
  return (
    <AuthenticatedPageWrapper rightSidebarType="movie">
      <Container fluid className="mb-5">
        <RoundButton className="d-lg-none w-100 my-3 fs-4">Add your movie</RoundButton>
        <PlayMovie embedId={
          additionalMovieData && additionalMovieData.video
          && additionalMovieData.video[0] && additionalMovieData.video[0].key
        }
        />
        <AboutMovie aboutMovieData={additionalMovieData as AdditionalMovieData} />
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default MovieDetails;
