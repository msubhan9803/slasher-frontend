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
import AuthenticatedPageWrapper from './components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
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
import Profile from './routes/profile/Profile';
import Notifications from './routes/notifications/Notifications';
import Account from './routes/account/Account';
import ResetPassword from './routes/reset-password/ResetPassword';
import AccountActivated from './routes/account-activated/AccountActivated';
import useGoogleAnalytics from './hooks/useGoogleAnalytics';
// import Books from './routes/books/Books';
// import Shopping from './routes/shopping/Shopping';
// import Places from './routes/places/Places';
// import Podcasts from './routes/podcasts/Podcasts';

const analyticsId = process.env.REACT_APP_GOOGLE_ANALYTICS_PROPERTY_ID;
const DEFAULT_INDEX_REDIRECT = '/home';

const mainWrapperRoutes = {
  '/home': Home,
  '/:userName/*': Profile,
  '/search/*': Search,
  '/dating/*': Dating,
  '/messages': Messages,
  '/messages/conversation/:conversationId': Conversation,
  '/messages/conversation/user/:userId': Conversation,
  '/news/*': News,
  '/events/*': Events,
  '/posts/*': Posts,
  '/right-nav-viewer': TempRightNavViewer,
  '/movies/*': Movies,
  '/notifications': Notifications,
  '/account/*': Account,
  // '/podcasts/*': Podcasts,
  // '/books/*': Books,
  // '/shopping/*': Shopping,
  // '/places/*': Places,
};

const minimalWrapperRoutes = {
  '/sign-in': SignIn,
  '/forgot-password': ForgotPassword,
  '/reset-password': ResetPassword,
  '/verification-email-not-received': VerificationEmailNotReceived,
  '/registration/*': Registration,
  '/onboarding/*': Onboarding,
  '/account-activated': AccountActivated,
};

function App() {
  if (analyticsId) { useGoogleAnalytics(analyticsId); }

  return (
    <Routes>
      {/* Top level redirect */}
      <Route path="/" element={<Navigate to={DEFAULT_INDEX_REDIRECT} replace />} />

      {
        Object.entries(mainWrapperRoutes).map(
          ([routePath, ComponentForRoute]) => (
            <Route
              key={routePath}
              path={routePath}
              element={(
                <AuthenticatedPageWrapper>
                  <ComponentForRoute />
                </AuthenticatedPageWrapper>
              )}
            />
          ),
        )
      }

      {
        Object.entries(minimalWrapperRoutes).map(
          ([routePath, ComponentForRoute]) => (
            <Route
              key={routePath}
              path={routePath}
              element={(
                <UnauthenticatedPageWrapper>
                  <ComponentForRoute />
                </UnauthenticatedPageWrapper>
              )}
            />
          ),
        )
      }

      <Route path="*" element={<UnauthenticatedPageWrapper><NotFound /></UnauthenticatedPageWrapper>} />
    </Routes>
  );
}
export default App;
