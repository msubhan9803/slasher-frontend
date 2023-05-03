import React from 'react';
import { Navigate } from 'react-router-dom';
import PublicHomePage from './public-home-page/PublicHomePage';
import { userIsLoggedIn } from '../utils/session-utils';
import { isCapacitorApp } from '../constants';

function HomePage() {
  return isCapacitorApp ? <Navigate to="app/sign-in" replace /> : <PublicHomePage />;
}

function Index() {
  return userIsLoggedIn()
    ? <Navigate to="/app/home" replace />
    : <HomePage />;
}

export default Index;
