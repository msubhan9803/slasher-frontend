import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VerificationEmailNotReceived from './routes/verification-email-not-received/VerificationEmailNotReceived';
import ForgotPassword from './routes/forgot-password/ForgotPassword';
import Home from './routes/home/Home';
import NotFound from './routes/NotFound';
import Registration from './routes/registration/Registration';
import SignIn from './routes/sign-in/SignIn';
import RegistrationFinal from './routes/registration/RegistrationFinal';
import DatingSetupIdentity from './routes/dating/setup/DatingSetupIdentity';
import DatingSetupAddPhotos from './routes/dating/setup/DatingSetupAddPhotos';
import DatingSetupAboutMe from './routes/dating/setup/DatingSetupAboutMe';
import DatingWelcomeScreen from './routes/dating/DatingWelcomeScreen';
import DataingSetupAdditionalPreferences from './routes/dating/setup/DataingSetupAdditionalPreferences';
import DatingPreferences from './routes/dating/DatingPreferences';
import DatingSetupAdditionalInfo from './routes/dating/setup/additional-info/DatingSetupAdditionalInfo';

function App() {
  const topLevelRedirectPath = '/home'; // TODO: Base this on whether or not user is signed in

  return (
    <Routes>
      {/* Top level redirect */}
      <Route
        path="/"
        element={<Navigate to={topLevelRedirectPath} replace />}
      />
      {/* Unauthenticated routes */}
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/verification-email-not-received"
        element={<VerificationEmailNotReceived />}
      />
      <Route path="/registration/final" element={<RegistrationFinal />} />
      <Route path="/dating/setup/identity" element={<DatingSetupIdentity />} />
      <Route path="/dating/setup/add-photos" element={<DatingSetupAddPhotos />} />
      <Route path="/dating/setup/about-me" element={<DatingSetupAboutMe />} />
      <Route path="/dating/welcome" element={<DatingWelcomeScreen />} />
      <Route path="/dating/setup/additional-preferences" element={<DataingSetupAdditionalPreferences />} />
      <Route path="/dating/preferences" element={<DatingPreferences />} />
      <Route path="/dating/setup/additional-info" element={<DatingSetupAdditionalInfo />} />
      {/* Authenticated routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/registration/*" element={<Registration />} />
      {/* May be authenticated or unauthenticated */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
export default App;
