/* eslint-disable no-alert */
/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import {
  Route, RouterProvider, createBrowserRouter, createRoutesFromElements,
} from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { isAndroid, isIOS } from 'react-device-detect';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
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
import {
  topStatuBarBackgroundColorAndroidOnly, isNativePlatform,
  GOOGLE_PLAY_DOWNLOAD_URL,
  APP_STORE_DOWNLOAD_URL,
} from './constants';
import Books from './routes/books/Books';
import Artists from './routes/artists/Artists';
import Podcasts from './routes/podcasts/Podcasts';
import Music from './routes/music/Music';
import SocialGroups from './routes/social-group/SocialGroups';
import ActivateAccount from './routes/activate-account/ActivateAccount';
import PasswordResetSuccess from './routes/password-reset-success/PasswordResetSuccess';
// import Index from './routes/Index';
import ChangeEmailConfirm from './routes/change-email/ChangeEmailConfirm';
import ChangeEmailRevert from './routes/change-email/ChangeEmailRevert';
import PublicProfile from './routes/public-home-page/public-profile-web/PublicProfile';
import { useAppSelector } from './redux/hooks';
import ServerUnavailable from './components/ServerUnavailable';
import Conversation from './routes/conversation/Conversation';
import Index from './routes/Index';
import { onKeyboardClose, onKeyboardOpen } from './utils/styles-utils ';
import UnexpectedError from './components/UnexpectedError';
import { healthCheck } from './api/health-check';
import { store } from './redux/store';
import { setIsServerAvailable } from './redux/slices/serverAvailableSlice';
import { isHomePage } from './utils/url-utils';
import CapacitorAppListeners from './components/CapacitorAppListeners';
import DebugGoogleAnalytics from './routes/debug-google-analytics';
import { detectAppVersion } from './utils/version-utils';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { enableADs, enableDevFeatures } from './env';
import Admin from './routes/admin/Admin';
import useTPDAdSlots from './hooks/useTPDAdSlots';
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
  'app/admin/*': { wrapper: AuthenticatedPageWrapper, component: Admin },
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
  'app/books/*': { wrapper: AuthenticatedPageWrapper, component: Books },
  // 'app/shopping/*': { wrapper: AuthenticatedPageWrapper, component: Shopping },
  // 'app/places/*': { wrapper: AuthenticatedPageWrapper, component: Places },
  // 'app/books/*': { wrapper: AuthenticatedPageWrapper, component: Books },
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
  // routes['shopping/*'] = { wrapper: AuthenticatedPageWrapper, component: Shopping };
  // routes['places/*'] = { wrapper: AuthenticatedPageWrapper, component: Places };
  routes['app/debug-google-analytics'] = { wrapper: UnauthenticatedPageWrapper, component: DebugGoogleAnalytics };
}

CapacitorApp.addListener('backButton', () => {
  if (isHomePage(window.location.pathname)) {
    CapacitorApp.exitApp();
  } else {
    window.history.back();
  }
});

if (isNativePlatform) {
  const SERVER_UNAVAILABILITY_CHECK_DELAY = 3_000;
  setTimeout(() => {
    healthCheck().catch(() => {
      store.dispatch(setIsServerAvailable(false));
    });
  }, SERVER_UNAVAILABILITY_CHECK_DELAY);

  // Display content under transparent status bar (Android only)
  StatusBar.setOverlaysWebView({ overlay: false });
  StatusBar.setBackgroundColor({ color: topStatuBarBackgroundColorAndroidOnly });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Keyboard.addListener('keyboardWillShow', (info) => {
    onKeyboardOpen();
  });
  Keyboard.addListener('keyboardWillHide', () => {
    onKeyboardClose();
  });
}

function App() {
  useTPDAdSlots(enableADs);

  const [appVersionDetected, setAppVersionDetected] = useState<boolean>(false);
  const isServerAvailable = useAppSelector((state) => state.serverAvailability.isAvailable);

  useEffect(() => {
    (async () => {
      await detectAppVersion();
      setAppVersionDetected(true);
    })();
  }, []);

  useEffect(() => {
    const redirectToStore = () => {
      if (isIOS) {
        window.open(APP_STORE_DOWNLOAD_URL, '_blank');
      } else if (isAndroid) {
        window.open(GOOGLE_PLAY_DOWNLOAD_URL, '_blank');
      }
    };
    redirectToStore();
  }, []);

  if (!appVersionDetected) { return <div />; }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={<CapacitorAppListeners />}
        errorElement={<UnauthenticatedPageWrapper><UnexpectedError /></UnauthenticatedPageWrapper>}
      >
        <Route path="/" element={<Index />} />
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
      {/* // ! Remove this after testing TPD ads */}
      {/* {!tpdLoaded && 'TPD script is loading...'} */}
      {isServerAvailable || <ServerUnavailable />}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
