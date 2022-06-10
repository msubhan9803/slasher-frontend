import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VerificationEmailNotReceived from './routes/verification-email-not-received/VerificationEmailNotReceived';
import ForgotPassword from './routes/forgot-password/ForgotPassword';
import Home from './routes/home/Home';
import NotFound from './routes/NotFound';
import Registration from './routes/registration/Registration';
import SignIn from './routes/sign-in/SignIn';
import Dating from './routes/dating/Dating';

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

      {/* Authenticated routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/dating/*" element={<Dating />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
export default App;
