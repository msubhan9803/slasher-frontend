/* eslint-disable max-len */
import React from 'react';
import { MovieData } from '../../../types';

type RatingUpdate = {
  rating: number,
  ratingUsersCount: number,
  userData: {
    rating: number
  }
};
type GoreRatingUpdate = {
  goreFactorRating: number,
  goreFactorRatingUsersCount: number,
  userData: {
    goreFactorRating: number,
  }
};
type WorthWatchUpdate = {
  worthWatching: number,
  worthWatchingUpUsersCount: number,
  worthWatchingDownUsersCount: number,
  userData: {
    worthWatching: number,
  },
};
type RateType = 'rating' | 'goreFactorRating' | 'worthWatching';
type SetMovieData = React.Dispatch<React.SetStateAction<MovieData | undefined>>;

export const updateMovieUserData = (update: any, rateType: RateType, setMovieData: SetMovieData) => {
  if (!update || !rateType) { return; }
  setMovieData?.((prevMovieData) => {
    if (!prevMovieData) { return prevMovieData; }
    if (rateType === 'rating') {
      // eslint-disable-next-line
        const { rating, ratingUsersCount, userData } = update as RatingUpdate;
      return ({
        ...prevMovieData,
        rating,
        ratingUsersCount,
        userData: { ...prevMovieData.userData!, rating: userData.rating },
      });
    }
    if (rateType === 'goreFactorRating') {
      // eslint-disable-next-line
        const { goreFactorRating, goreFactorRatingUsersCount, userData } = update as GoreRatingUpdate;
      return ({
        ...prevMovieData,
        goreFactorRating,
        goreFactorRatingUsersCount,
        userData: { ...prevMovieData.userData!, goreFactorRating: userData.goreFactorRating },
      });
    }
    if (rateType === 'worthWatching') {
      const {
        worthWatching, worthWatchingUpUsersCount, worthWatchingDownUsersCount, userData,
      } = update as WorthWatchUpdate;

      if (!prevMovieData) { return prevMovieData; }
      return ({
        ...prevMovieData,
        worthWatching,
        worthWatchingUpUsersCount,
        worthWatchingDownUsersCount,
        userData: {
          ...prevMovieData.userData!,
          worthWatching: userData.worthWatching,
        },
      });
    }
    // return previous state data in case no `rateType` values match
    return prevMovieData;
  });
};
