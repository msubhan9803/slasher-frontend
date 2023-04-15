import React from 'react';
import { Navigate } from 'react-router-dom';
import PublicHomePage from './public-home-page/PublicHomePage';
import { userIsLoggedIn } from '../utils/session-utils';

function Index() {
  return userIsLoggedIn()
    ? <Navigate to="/app/home" replace />
    : <PublicHomePage />;
}

export default Index;
