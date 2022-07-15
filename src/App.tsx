import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VerificationEmailNotReceived from './routes/verification-email-not-received/VerificationEmailNotReceived';
import ForgotPassword from './routes/forgot-password/ForgotPassword';
import Home from './routes/home/Home';
import Registration from './routes/registration/Registration';
import SignIn from './routes/sign-in/SignIn';
import Dating from './routes/dating/Dating';
import UnauthenticatedPageWrapper from './components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import NotFound from './components/NotFound';
import Messages from './routes/messages/Messages';
import News from './routes/news/News';
import Onboarding from './routes/onboarding/Onboarding';
import Events from './routes/events/Events';
import Posts from './routes/posts/Posts';
import Search from './routes/search/Search';
import TempRightNavViewer from './routes/temp-right-nav-viewer/TempRightNavViewer';
import MovieDetails from './routes/movies/MovieDetails';

function App() {
  const topLevelRedirectPath = '/home'; // TODO: Base this on whether or not user is signed in

  return (
    <Routes>
      {/* Top level redirect */}
      <Route path="/" element={<Navigate to={topLevelRedirectPath} replace />} />

      {/* Unauthenticated routes */}
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verification-email-not-received" element={<VerificationEmailNotReceived />} />
      <Route path="/registration/*" element={<Registration />} />
      <Route path="/onboarding/*" element={<Onboarding />} />

      {/* Authenticated routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/news" element={<News />} />
      <Route path="/search" element={<Search />} />
      <Route path="/dating/*" element={<Dating />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/news/*" element={<News />} />
      <Route path="/events/*" element={<Events />} />
      <Route path="/posts/*" element={<Posts />} />
      <Route path="/right-nav-viewer" element={<TempRightNavViewer />} />
      <Route path="/movies/1" element={<MovieDetails />} />

      {/* Fallback */}
      <Route path="*" element={<UnauthenticatedPageWrapper><NotFound /></UnauthenticatedPageWrapper>} />
    </Routes>
  );
}
export default App;
