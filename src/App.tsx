import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ForgotPassword from './routes/forgot-password/ForgotPassword';
import Home from './routes/home/Home';
import NotFound from './routes/NotFound';
import Registration from './routes/registration/Registration';
import SignIn from './routes/sign-in/SignIn';
import VerifyEmail from './routes/registration/Final';

function App() {
  const topLevelRedirectPath = '/home'; // TODO: Base this on whether or not user is signed in

  return (
    <Routes>
      {/* Top level redirect */}
      <Route path="/" element={<Navigate to={topLevelRedirectPath} replace />} />
      {/* Unauthenticated routes */}
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/registration/final" element={<VerifyEmail />} />
      {/* Authenticated routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/registration/*" element={<Registration />} />
      {/* May be authenticated or unauthenticated */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Unauthenticated routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
export default App;
