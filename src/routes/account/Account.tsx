import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ContentSidbarWrapper, ContentPageWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import AccountBlockedUser from './AccountBlockedUser/AccountBlockedUser';
import AccountChangePassword from './AccountChangePassword/AccountChangePassword';
import AccountDelete from './AccountDelete/AccountDelete';
import AccountNotification from './AccountNotification/AccountNotification';
import AccountSettings from './AccountSettings/AccountSettings';
import ScrollToTopOnPathnameChange from '../../components/ScrollToTopOnPathnameChange';

function Account() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <ScrollToTopOnPathnameChange />
        <Routes>
          <Route path="/" element={<Navigate to="notifications" replace />} />
          <Route path="/notifications" element={<AccountNotification />} />
          <Route path="/blocked-users" element={<AccountBlockedUser />} />
          <Route path="/change-password" element={<AccountChangePassword />} />
          <Route path="/sign-out" element={<AccountSettings />} />
          <Route path="/delete-account" element={<AccountDelete />} />
          <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
        </Routes>
      </ContentPageWrapper>

      {/* Global right sidebar for all above routes */}
      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default Account;
