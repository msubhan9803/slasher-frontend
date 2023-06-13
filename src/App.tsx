import React, { useEffect } from 'react';
import {
  Navigate,
  Outlet,
  Route, RouterProvider, createBrowserRouter, createRoutesFromElements, useNavigate,
} from 'react-router-dom';
import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app';
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
import Artists from './routes/artists/Artists';
import Podcasts from './routes/podcasts/Podcasts';
import Music from './routes/music/Music';
import SocialGroups from './routes/social-group/SocialGroups';
import { enableDevFeatures } from './utils/configEnvironment';
import ActivateAccount from './routes/activate-account/ActivateAccount';
import PasswordResetSuccess from './routes/password-reset-success/PasswordResetSuccess';
// import Index from './routes/Index';
import ChangeEmailConfirm from './routes/change-email/ChangeEmailConfirm';
import ChangeEmailRevert from './routes/change-email/ChangeEmailRevert';
import PublicProfile from './routes/public-home-page/public-profile-web/PublicProfile';
import { useAppSelector } from './redux/hooks';
import ServerUnavailable from './components/ServerUnavailable';
import Conversation from './routes/conversation/Conversation';
// import Books from './routes/books/Books';
// import Shopping from './routes/shopping/Shopping';
// import Places from './routes/places/Places';

interface TopLevelRoute {
  component: any;
  wrapper: any;
  wrapperProps?: {
    hideTopLogo?: boolean;
    hideFooter?: boolean;
    valign?: 'start' | 'center' | 'end',
    isSignIn?: boolean;
  };
}

const routes: Record<string, TopLevelRoute> = {
  ':userName/*': { wrapper: AuthenticatedPageWrapper, component: Profile },
  ':userName': { wrapper: UnauthenticatedPageWrapper, component: PublicProfile, wrapperProps: { hideTopLogo: true, hideFooter: true } },
  'app/home': { wrapper: AuthenticatedPageWrapper, component: Home },
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
  // 'app/shopping/*': { wrapper: AuthenticatedPageWrapper, component: Shopping },
  // 'app/places/*': { wrapper: AuthenticatedPageWrapper, component: Places },
  'app/books/*': { wrapper: AuthenticatedPageWrapper, component: Books },
  'app/music/*': { wrapper: AuthenticatedPageWrapper, component: Music },
  'app/art/*': { wrapper: AuthenticatedPageWrapper, component: Artists },
  'app/forgot-password': { wrapper: UnauthenticatedPageWrapper, component: ForgotPassword },
  'app/reset-password': { wrapper: UnauthenticatedPageWrapper, component: ResetPassword },
  'app/email-change/confirm': { wrapper: UnauthenticatedPageWrapper, component: ChangeEmailConfirm },
  'app/email-change/revert': { wrapper: UnauthenticatedPageWrapper, component: ChangeEmailRevert },
  'app/password-reset-success': { wrapper: UnauthenticatedPageWrapper, component: PasswordResetSuccess },
  'app/verification-email-not-received': {
    wrapper: UnauthenticatedPageWrapper,
    component: VerificationEmailNotReceived,
  },
  'app/registration/*': { wrapper: UnauthenticatedPageWrapper, component: Registration },
  'app/onboarding/*': { wrapper: UnauthenticatedPageWrapper, component: Onboarding, wrapperProps: { hideFooter: true } },
  'app/activate-account': { wrapper: UnauthenticatedPageWrapper, component: ActivateAccount },
  'app/account-activated': { wrapper: UnauthenticatedPageWrapper, component: AccountActivated },
  'app/sign-in': { wrapper: UnauthenticatedPageWrapper, component: SignIn, wrapperProps: { hideTopLogo: true, isSignIn: true } },
};

if (enableDevFeatures) {
  routes['app/dating/*'] = { wrapper: AuthenticatedPageWrapper, component: Dating };
  routes['app/groups/*'] = { wrapper: AuthenticatedPageWrapper, component: SocialGroups };
  // routes['podcasts/*'] = { wrapper: AuthenticatedPageWrapper, component: Podcasts };
  // routes['books/*'] = { wrapper: AuthenticatedPageWrapper, component: Books };
  // routes['shopping/*'] = { wrapper: AuthenticatedPageWrapper, component: Shopping };
  // routes['places/*'] = { wrapper: AuthenticatedPageWrapper, component: Places };
}

CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  if (!canGoBack) {
    CapacitorApp.exitApp();
  } else {
    window.history.back();
  }
});

function AppUrlListener() {
  const navigate = useNavigate();
  useEffect(() => {
    CapacitorApp.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      const { pathname, search, hash } = new URL(event.url);
      const routePath = pathname + search + hash;
      if (routePath) {
        navigate(routePath);
      }
    });
  }, [navigate]);

  return (
    <Outlet />
  );
}

function App() {
  usePubWiseAdSlots(enableADs);
  const isServerAvailable = useAppSelector((state) => state.serverAvailability.isAvailable);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<AppUrlListener />}>
        {/* TODO: Uncomment line below when switching from beta to prod */}
        {/* <Route path="/" element={<Index />} /> */}
        {/* TODO: REMOVE line below when switching from beta to prod */}
        <Route path="/" element={<Navigate to="/app/home" replace />} />
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
    <>
      {isServerAvailable || <ServerUnavailable />}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
