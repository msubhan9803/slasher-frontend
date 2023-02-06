import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import PlayMovie from './PlayMovie';
import RoundButton from '../../../components/ui/RoundButton';
import AboutMovie from './AboutMovie';
import { getMoviesById, getMoviesDataById } from '../../../api/movies';
import { AdditionalMovieData } from '../../../types';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import MovieRightSideNav from '../components/MovieRightSideNav';

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
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Container fluid className="mb-5">
          <RoundButton className="d-lg-none w-100 my-3 fs-4">Add your movie</RoundButton>
          {additionalMovieData?.video?.[0]?.key && (
            <PlayMovie embedId={
              additionalMovieData && additionalMovieData.video
              && additionalMovieData.video[0] && additionalMovieData.video[0].key
            }
            />
          )}
          <AboutMovie aboutMovieData={additionalMovieData as AdditionalMovieData} />
        </Container>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <MovieRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default MovieDetails;
