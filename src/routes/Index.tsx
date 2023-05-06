import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PublicHomePage from './public-home-page/PublicHomePage';
import { isCapacitorApp } from '../constants';
import { getSessionToken } from '../utils/session-utils';

function HomePage() {
  return isCapacitorApp ? <Navigate to="app/sign-in" replace /> : <PublicHomePage />;
}

type IsUserLoggedIn = { isLoading: boolean, value: null | boolean };

function Index() {
  // NOTE: We fetch `token` from cookies/capacitor-shared-preferences-api to
  // know if user is logged in.
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<IsUserLoggedIn>({
    isLoading: true, value: null,
  });
  useEffect(() => {
    getSessionToken().then((token) => {
      setIsUserLoggedIn({ isLoading: false, value: Boolean(token) });
    });
  }, []);

  if (isUserLoggedIn.isLoading) { return null; }

  return isUserLoggedIn.value
    ? <Navigate to="/app/home" replace />
    : <HomePage />;
}

export default Index;
