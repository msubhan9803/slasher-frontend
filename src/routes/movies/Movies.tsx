import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AddYourMovie from './AddYourMovie';
import AllMovies from './all-movies/AllMovies';
import MovieDetails from './movie-details/MovieDetails';
import FavoriteMovies from './favorite-movies/FavoriteMovies';
import BuyMovieList from './buy-movie-list/BuyMovieList';
import MyMovies from './my-movies/MyMovies';
import SlasherIndieMovies from './slasher-indie-movies/SlasherIndieMovies';
import WatchListMovies from './watch-list-movies/WatchListMovies';
import WatchedListMovies from './watched-list-movies/WatchedListMovies';

function Movies() {
  return (
    <Routes>
      <Route path="all" element={<AllMovies />} />
      <Route path="slasher-indie" element={<SlasherIndieMovies />} />
      <Route path="favorites" element={<FavoriteMovies />} />
      <Route path="watch-list" element={<WatchListMovies />} />
      <Route path="watched-list" element={<WatchedListMovies />} />
      <Route path="buy-list" element={<BuyMovieList />} />
      <Route path="my-movies" element={<MyMovies />} />
      <Route path="add" element={<AddYourMovie />} />
      <Route path=":id/*" element={<MovieDetails />} />
      <Route path="*" element={<Navigate to="all" replace />} />
    </Routes>
  );
}

export default Movies;
