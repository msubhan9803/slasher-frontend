/* eslint-disable max-len */
import React from 'react';
import { BookData } from '../../../types';

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
type SetBookData = React.Dispatch<React.SetStateAction<BookData | undefined>>;

export const updateBookUserData = (update: any, rateType: RateType, setBookData: SetBookData) => {
  if (!update || !rateType) { return; }
  setBookData?.((prevBookData) => {
    if (!prevBookData) { return prevBookData; }
    if (rateType === 'rating') {
      // eslint-disable-next-line
      const { rating, ratingUsersCount, userData } = update as RatingUpdate;
      return ({
        ...prevBookData,
        rating,
        ratingUsersCount,
        userData: { ...prevBookData.userData!, rating: userData.rating },
      });
    }
    if (rateType === 'goreFactorRating') {
      // eslint-disable-next-line
      const { goreFactorRating, goreFactorRatingUsersCount, userData } = update as GoreRatingUpdate;
      return ({
        ...prevBookData,
        goreFactorRating,
        goreFactorRatingUsersCount,
        userData: { ...prevBookData.userData!, goreFactorRating: userData.goreFactorRating },
      });
    }
    if (rateType === 'worthWatching') {
      const {
        worthWatching, worthWatchingUpUsersCount, worthWatchingDownUsersCount, userData,
      } = update as WorthWatchUpdate;

      if (!prevBookData) { return prevBookData; }
      return ({
        ...prevBookData,
        worthWatching,
        worthWatchingUpUsersCount,
        worthWatchingDownUsersCount,
        userData: {
          ...prevBookData.userData!,
          worthWatching: userData.worthWatching,
        },
      });
    }
    // return previous state data in case no `rateType` values match
    return prevBookData;
  });
};
