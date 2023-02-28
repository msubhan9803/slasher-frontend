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
import UnauthenticatedPageWrapper
  from './components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
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
import Books from './routes/books/Books';
import Artists from './routes/art/Artists';
import Podcasts from './routes/podcasts/Podcasts';
import Music from './routes/music/Music';
import SocialGroups from './routes/social-group/SocialGroups';
import { enableDevFeatures } from './utils/configEnvironment';
// import Books from './routes/books/Books';
// import Shopping from './routes/shopping/Shopping';
// import Places from './routes/places/Places';

const DEFAULT_INDEX_REDIRECT = 'app/home';

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
  'app/home': { wrapper: AuthenticatedPageWrapper, component: Home },
  ':userName/*': { wrapper: AuthenticatedPageWrapper, component: Profile },
  'app/search/*': { wrapper: AuthenticatedPageWrapper, component: Search },
  'app/messages': { wrapper: AuthenticatedPageWrapper, component: Messages },
  'app/messages/conversation/:conversationId': { wrapper: AuthenticatedPageWrapper, component: Conversation },
  'app/messages/conversation/user/:userId': { wrapper: AuthenticatedPageWrapper, component: Conversation },
  'app/news/*': { wrapper: AuthenticatedPageWrapper, component: News },
  'app/events/*': { wrapper: AuthenticatedPageWrapper, component: Events },
  'app/posts/*': { wrapper: AuthenticatedPageWrapper, component: Posts },
  'app/movies/*': { wrapper: AuthenticatedPageWrapper, component: Movies },
  'app/notifications': { wrapper: AuthenticatedPageWrapper, component: Notifications },
  'app/account/*': { wrapper: AuthenticatedPageWrapper, component: Account },
  'app/podcasts/*': { wrapper: AuthenticatedPageWrapper, component: Podcasts },
  // 'shopping/*': { wrapper: AuthenticatedPageWrapper, component: Shopping },
  // 'places/*': { wrapper: AuthenticatedPageWrapper, component: Places },
  'app/books/*': { wrapper: AuthenticatedPageWrapper, component: Books },
  'app/music/*': { wrapper: AuthenticatedPageWrapper, component: Music },
  'app/art/*': { wrapper: AuthenticatedPageWrapper, component: Artists },
  'app/forgot-password': { wrapper: UnauthenticatedPageWrapper, component: ForgotPassword },
  'app/reset-password': { wrapper: UnauthenticatedPageWrapper, component: ResetPassword },
  'app/verification-email-not-received': {
    wrapper: UnauthenticatedPageWrapper,
    component: VerificationEmailNotReceived,
  },
  'app/registration/*': { wrapper: UnauthenticatedPageWrapper, component: Registration },
  'app/onboarding/*': { wrapper: UnauthenticatedPageWrapper, component: Onboarding, wrapperProps: { hideFooter: true } },
  'app/account-activated': { wrapper: UnauthenticatedPageWrapper, component: AccountActivated },
  'app/sign-in': { wrapper: UnauthenticatedPageWrapper, component: SignIn, wrapperProps: { hideTopLogo: true } },
};

if (enableDevFeatures) {
  routes['app/dating/*'] = { wrapper: AuthenticatedPageWrapper, component: Dating };
  routes['app/groups/*'] = { wrapper: AuthenticatedPageWrapper, component: SocialGroups };
  // routes['podcasts/*'] = { wrapper: AuthenticatedPageWrapper, component: Podcasts };
  // routes['books/*'] = { wrapper: AuthenticatedPageWrapper, component: Books };
  // routes['shopping/*'] = { wrapper: AuthenticatedPageWrapper, component: Shopping };
  // routes['places/*'] = { wrapper: AuthenticatedPageWrapper, component: Places };
}

function App() {
  usePubWiseAdSlots(enableADs);

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
