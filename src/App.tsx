import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './routes/home/Home';
import NotFound from './routes/NotFound';
import Registration from './routes/registration/Registration';
import SignIn from './routes/sign-in/SignIn';

function App() {
  const topLevelRedirectPath = '/home'; // TODO: Base this on whether or not user is signed in

  return (
    <Routes>
      {/* Top level redirect */}
      <Route path="/" element={<Navigate to={topLevelRedirectPath} replace />} />
      {/* Unauthenticated routes */}
      <Route path="/sign-in" element={<SignIn />} />
      {/* Authenticated routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/registration/*" element={<Registration />} />
      {/* May be authenticated or unauthenticated */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
export default App;
