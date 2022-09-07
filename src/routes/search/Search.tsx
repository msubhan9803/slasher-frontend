import React from 'react';
import {
  Navigate, Route, Routes,
} from 'react-router-dom';
import SearchMovies from './search-movies/SearchMovies';
import SearchEvents from './search-events/SearchEvents';
import SearchNews from './search-news/SearchNews';
import SearchHashtags from './search-hashtags/SearchHashtags';
import SearchPosts from './search-posts/SearchPosts';
import SearchPeople from './search-people/SearchPeople';
import SearchBooks from './search-books/SearchBooks';

function Search() {
  return (
    <Routes>
      <Route path="/*" element={<Navigate to="people" replace />} />
      <Route path="people" element={<SearchPeople />} />
      <Route path="posts" element={<SearchPosts />} />
      <Route path="hashtags" element={<SearchHashtags />} />
      <Route path="news" element={<SearchNews />} />
      <Route path="events" element={<SearchEvents />} />
      <Route path="movies" element={<SearchMovies />} />
      <Route path="books" element={<SearchBooks />} />
    </Routes>
  );
}

export default Search;
