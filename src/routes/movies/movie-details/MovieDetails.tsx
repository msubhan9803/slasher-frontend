import React, {
  useEffect, useLayoutEffect, useState, useMemo,
} from 'react';
import { Container } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import PlayMovie from './PlayMovie';
import RoundButton from '../../../components/ui/RoundButton';
import AboutMovie from './AboutMovie';
import { getMoviesById, getMoviesDataById, getUserDefinedMovieData } from '../../../api/movies';
import {
  AdditionalMovieData, MovieData, MoviePageCache, MovieType,
} from '../../../types';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { getPageStateCache, hasPageStateCache, setPageStateCache } from '../../../pageStateCache';
import { enableDevFeatures } from '../../../env';
import getYouTubeEmbedId from '../../../utils/youtube-embed-id-utils';

function MovieDetails() {
  const location = useLocation();
  // eslint-disable-next-line max-len
  const pageStateCache = useMemo(() => getPageStateCache(location) ?? { movieData: undefined, additionalMovieData: undefined }, [location]);

  const params = useParams();
  const [movieData, setMovieData] = useState<MovieData | undefined>(
    hasPageStateCache(location) ? pageStateCache.movieData : undefined,
  );
  const [movieType, setMovieType] = useState(
    hasPageStateCache(location) ? pageStateCache.movieType : null,
  );
  const [initialDataLoadedFromCache, setInitialDataLoadedFromCache] = useState(false);
  const [additionalMovieData, setAdditionalMovieData] = useState<AdditionalMovieData | undefined>(
    hasPageStateCache(location) ? pageStateCache.additionalMovieData : undefined,
  );

  useEffect(() => {
    if (hasPageStateCache(location) && !initialDataLoadedFromCache) {
      setInitialDataLoadedFromCache(true);
      setMovieData(pageStateCache.movieData);
      setMovieData(pageStateCache.movieType);
    }
  }, [pageStateCache, location, initialDataLoadedFromCache]);

  useEffect(() => (() => {
    if (movieData) {
      setPageStateCache<MoviePageCache>(location, {
        ...getPageStateCache(location), movieData,
      });
    }
  }), [movieData, location]);

  useEffect(() => {
    if (params.id && (!movieData || movieData?.isUpdated) && !movieType) {
      getMoviesById(params.id)
        .then((res) => {
          setMovieData(res.data);
          setMovieType(res.data.type);
          // Update `pageStateCache`
          setPageStateCache<MoviePageCache>(location, {
            ...getPageStateCache(location),
            movieData: res.data,
            movieType: res.data.type,
          });
        });
    }
  }, [location, movieData, params, movieType]);

  useEffect(() => {
    if (
      movieData
      && movieData.movieDBId
      && !additionalMovieData
      && movieType !== MovieType.UserDefined
    ) {
      getMoviesDataById(movieData.movieDBId)
        .then((res) => {
          setAdditionalMovieData(res.data);
          // Update `pageStateCache`
          setPageStateCache<MoviePageCache>(location, {
            ...getPageStateCache(location), additionalMovieData: res.data,
          });
        });
    }
  }, [additionalMovieData, location, movieData, movieType]);

  useEffect(() => {
    if (
      movieData
      && !additionalMovieData
      && movieType === MovieType.UserDefined
    ) {
      getUserDefinedMovieData(movieData._id)
        .then((res) => {
          setAdditionalMovieData(res.data);
          // Update `pageStateCache`
          setPageStateCache<MoviePageCache>(location, {
            ...getPageStateCache(location), additionalMovieData: res.data,
          });
        });
    }
  }, [additionalMovieData, location, movieData, movieType]);

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant' as any,
    });
  }, []);

  if (!movieType || !movieData || !additionalMovieData) {
    return <LoadingIndicator />;
  }

  return (
    <div>
      <Container fluid className="mb-5 p-0 pb-5">
        {enableDevFeatures && <RoundButton className="d-lg-none w-100 my-3 fs-4">Add your movie</RoundButton>}
        {movieType !== MovieType.UserDefined && additionalMovieData?.video?.[0]?.key && (
          <PlayMovie embedId={
            additionalMovieData && additionalMovieData.video
            && additionalMovieData.video[0] && additionalMovieData.video[0].key
          }
          />
        )}

        {movieType === MovieType.UserDefined && (
          <PlayMovie
            embedId={
                additionalMovieData
                && additionalMovieData.video
                && additionalMovieData.video[0]
                && getYouTubeEmbedId(additionalMovieData.video[0].key) as string
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
