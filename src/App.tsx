import React from 'react';
import {
  Routes, Route, Navigate,
} from 'react-router-dom';
import VerificationEmailNotReceived from './routes/verification-email-not-received/VerificationEmailNotReceived';
import ForgotPassword from './routes/forgot-password/ForgotPassword';
import Home from './routes/home/Home';
import Registration from './routes/registration/Registration';
import SignIn from './routes/sign-in/SignIn';
import Dating from './routes/dating/Dating';
import UnauthenticatedPageWrapper from './components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import NotFound from './components/NotFound';
import Conversation from './routes/conversation/Conversation';
import Messages from './routes/messages/Messages';
import News from './routes/news/News';
import Onboarding from './routes/onboarding/Onboarding';
import Events from './routes/events/Events';
import Posts from './routes/posts/Posts';
import Search from './routes/search/Search';
import Movies from './routes/movies/Movies';
import TempRightNavViewer from './routes/temp-right-nav-viewer/TempRightNavViewer';
import Books from './routes/books/Books';
import Shopping from './routes/shopping/Shopping';
import Places from './routes/places/Places';
import Profile from './routes/profile/Profile';
import Notifications from './routes/notifications/Notifications';
import Account from './routes/account/Account';
import Podcasts from './routes/podcasts/Podcasts';
import ResetPassword from './routes/reset-password/ResetPassword';
import AccountActivated from './routes/account-activated/AccountActivated';

function App() {
  const topLevelRedirectPath = '/home'; // TODO: Base this on whether or not user is signed in

  return (
    <Routes>
      {/* Top level redirect */}
      <Route path="/" element={<Navigate to={topLevelRedirectPath} replace />} />

      {/* Unauthenticated routes */}
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verification-email-not-received" element={<VerificationEmailNotReceived />} />
      <Route path="/registration/*" element={<Registration />} />
      <Route path="/onboarding/*" element={<Onboarding />} />
      <Route path="/account-activated" element={<AccountActivated />} />

      {/* Authenticated routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/search/*" element={<Search />} />
      <Route path="/dating/*" element={<Dating />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/messages/conversation/:conversationId" element={<Conversation />} />
      <Route path="/messages/conversation/user/:userId" element={<Conversation />} />
      <Route path="/news/*" element={<News />} />
      <Route path="/events/*" element={<Events />} />
      <Route path="/posts/*" element={<Posts />} />
      <Route path="/right-nav-viewer" element={<TempRightNavViewer />} />
      <Route path="/movies/*" element={<Movies />} />
      <Route path="/podcasts/*" element={<Podcasts />} />
      <Route path="/books/*" element={<Books />} />
      <Route path="/shopping/*" element={<Shopping />} />
      <Route path="/places/*" element={<Places />} />
      <Route path="/:userName/*" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/account/*" element={<Account />} />
      <Route path="/podcasts/*" element={<Podcasts />} />
      {/* Fallback */}
      <Route path="*" element={<UnauthenticatedPageWrapper><NotFound /></UnauthenticatedPageWrapper>} />
    </Routes>
  );
}
export default App;
