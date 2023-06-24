import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import PlayMovie from './PlayMovie';
import RoundButton from '../../../components/ui/RoundButton';
import AboutMovie from './AboutMovie';
import { getMoviesById, getMoviesDataById } from '../../../api/movies';
import { AdditionalMovieData, MovieData, MoviePageCache } from '../../../types';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { enableDevFeatures } from '../../../constants';
import { getPageStateCache, hasPageStateCache, setPageStateCache } from '../../../pageStateCache';

function MovieDetails() {
  const location = useLocation();
  const pageStateCache: MoviePageCache = getPageStateCache(location)
    ?? { movieData: undefined, additionalMovieData: undefined };

  const params = useParams();
  const [movieData, setMovieData] = useState<MovieData | undefined>(
    hasPageStateCache(location) ? pageStateCache.movieData : undefined,
  );
  const [additionalMovieData, setAdditionalMovieData] = useState<AdditionalMovieData | undefined>(
    hasPageStateCache(location) ? pageStateCache.additionalMovieData : undefined,
  );
  useEffect(() => {
    if (params.id && (!movieData || movieData?.isUpdated)) {
      getMoviesById(params.id)
        .then((res) => {
          setMovieData(res.data);
          // Update `pageStateCache`
          setPageStateCache<MoviePageCache>(location, {
            ...getPageStateCache(location), movieData: res.data,
          });
        });
    }
  }, [location, movieData, params]);
  useEffect(() => {
    if (movieData && movieData.movieDBId && !additionalMovieData) {
      getMoviesDataById(movieData.movieDBId)
        .then((res) => {
          setAdditionalMovieData(res.data);
          // Update `pageStateCache`
          setPageStateCache<MoviePageCache>(location, {
            ...getPageStateCache(location), additionalMovieData: res.data,
          });
        });
    }
  }, [additionalMovieData, location, movieData]);

  if (!movieData || !additionalMovieData) {
    return <LoadingIndicator />;
  }

  return (
    <div>
      <Container fluid className="mb-5 p-0">
        {enableDevFeatures && <RoundButton className="d-lg-none w-100 my-3 fs-4">Add your movie</RoundButton>}
        {additionalMovieData?.video?.[0]?.key && (
          <PlayMovie embedId={
            additionalMovieData && additionalMovieData.video
            && additionalMovieData.video[0] && additionalMovieData.video[0].key
          }
          />
        )}
        <AboutMovie
          movieData={movieData}
          setMovieData={setMovieData}
          aboutMovieData={additionalMovieData as AdditionalMovieData}
        />
      </Container>
    </div>
  );
}

export default MovieDetails;
