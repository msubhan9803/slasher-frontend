import React from 'react';
import {
  Route, Navigate, RouterProvider, createBrowserRouter, createRoutesFromElements,
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
import Profile from './routes/profile/Profile';
import Notifications from './routes/notifications/Notifications';
import Account from './routes/account/Account';
import ResetPassword from './routes/reset-password/ResetPassword';
import AccountActivated from './routes/account-activated/AccountActivated';
import usePubWiseAdSlots from './hooks/usePubWiseAdSlots';
import { enableADs } from './constants';
// import Books from './routes/books/Books';
// import Shopping from './routes/shopping/Shopping';
// import Places from './routes/places/Places';
// import Podcasts from './routes/podcasts/Podcasts';

const DEFAULT_INDEX_REDIRECT = 'home';

interface TopLevelRoute {
  component: any;
  wrapper: any;
  wrapperProps?: {
    hideTopLogo?: boolean;
    hideFooter?: boolean;
    valign?: 'start' | 'center' | 'end';
  };
}

const routes: Record<string, TopLevelRoute> = {
  home: { wrapper: AuthenticatedPageWrapper, component: Home },
  ':userName/*': { wrapper: AuthenticatedPageWrapper, component: Profile },
  'search/*': { wrapper: AuthenticatedPageWrapper, component: Search },
  'dating/*': { wrapper: AuthenticatedPageWrapper, component: Dating },
  messages: { wrapper: AuthenticatedPageWrapper, component: Messages },
  'messages/conversation/:conversationId': { wrapper: AuthenticatedPageWrapper, component: Conversation },
  'messages/conversation/user/:userId': { wrapper: AuthenticatedPageWrapper, component: Conversation },
  'news/*': { wrapper: AuthenticatedPageWrapper, component: News },
  'events/*': { wrapper: AuthenticatedPageWrapper, component: Events },
  'posts/*': { wrapper: AuthenticatedPageWrapper, component: Posts },
  'movies/*': { wrapper: AuthenticatedPageWrapper, component: Movies },
  notifications: { wrapper: AuthenticatedPageWrapper, component: Notifications },
  'account/*': { wrapper: AuthenticatedPageWrapper, component: Account },
  // 'podcasts/*': { wrapper: AuthenticatedPageWrapper, component: Podcasts },
  // 'books/*': { wrapper: AuthenticatedPageWrapper, component: Books },
  // 'shopping/*': { wrapper: AuthenticatedPageWrapper, component: Shopping },
  // 'places/*': { wrapper: AuthenticatedPageWrapper, component: Places },
  'forgot-password': { wrapper: UnauthenticatedPageWrapper, component: ForgotPassword },
  'reset-password': { wrapper: UnauthenticatedPageWrapper, component: ResetPassword },
  'verification-email-not-received': { wrapper: UnauthenticatedPageWrapper, component: VerificationEmailNotReceived },
  'registration/*': { wrapper: UnauthenticatedPageWrapper, component: Registration },
  'onboarding/*': { wrapper: UnauthenticatedPageWrapper, component: Onboarding, wrapperProps: { hideFooter: true } },
  'account-activated': { wrapper: UnauthenticatedPageWrapper, component: AccountActivated },
  'sign-in': { wrapper: UnauthenticatedPageWrapper, component: SignIn, wrapperProps: { hideTopLogo: true } },
};

function App() {
  if (enableADs) { usePubWiseAdSlots(); }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/" element={<Navigate to={DEFAULT_INDEX_REDIRECT} replace />} />
        {
          Object.entries(routes).map(
            ([routePath, opts]) => (
              <Route
                key={routePath}
                path={routePath}
                element={(
                  <opts.wrapper {...(opts.wrapperProps)}>
                    <opts.component />
                  </opts.wrapper>
                )}
              />
            ),
          )
        }
        <Route path="*" element={<UnauthenticatedPageWrapper><NotFound /></UnauthenticatedPageWrapper>} />
      </Route>,
    ),
  );

  return (
    <RouterProvider router={router} />
  );
}
export default App;
