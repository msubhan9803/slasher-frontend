import React from 'react';
import { Navigate } from 'react-router-dom';
import PublicHomePage from './public-home-page/PublicHomePage';
import { isNativePlatform } from '../constants';
import useSessionToken from '../hooks/useSessionToken';

function HomePage() {
  return isNativePlatform ? <Navigate to="app/sign-in" replace /> : <PublicHomePage />;
}

function Index() {
  const token = useSessionToken();
  const userIsLoggedIn = !token.isLoading && token.value;
  return userIsLoggedIn ? <Navigate to="/app/home" replace /> : <HomePage />;
}

export default Index;
