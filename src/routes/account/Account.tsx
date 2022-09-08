import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AccountBlockedUser from './AccountBlockedUser/AccountBlockedUser';
import AccountChangePassword from './AccountChangePassword/AccountChangePassword';
import AccountDelete from './AccountDelete/AccountDelete';
import AccountNotification from './AccountNotification/AccountNotification';
import AccountSettings from './AccountSettings/AccountSettings';

function Account() {
  return (
    <Routes>
      <Route path="/settings" element={<AccountSettings />} />
      <Route path="/notifications" element={<AccountNotification />} />
      <Route path="/blocked-users" element={<AccountBlockedUser />} />
      <Route path="/change-password" element={<AccountChangePassword />} />
      <Route path="/delete-account" element={<AccountDelete />} />
    </Routes>
  );
}

export default Account;
