import React from 'react';
import { Navigate } from 'react-router-dom';
import PublicHomePage from './public-home-page/PublicHomePage';
import { isCapacitorApp } from '../constants';
import useSessionToken from '../hooks/useSessionToken';

function HomePage() {
  return isCapacitorApp ? <Navigate to="app/sign-in" replace /> : <PublicHomePage />;
}

function Index() {
  const token = useSessionToken();
  const useIsNotLoggedIn = (token.isLoading || !token.value);
  return useIsNotLoggedIn ? <HomePage /> : <Navigate to="/app/home" replace />;
}

export default Index;
