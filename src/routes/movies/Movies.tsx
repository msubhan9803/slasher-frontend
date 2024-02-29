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
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import MovieRightSideNav from './components/MovieRightSideNav';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';

function Movies() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
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
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>

      {/* Global right sidebar for all above routes */}
      <RightSidebarWrapper>
        <MovieRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default Movies;
