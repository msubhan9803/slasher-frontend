import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ContentSidbarWrapper, ContentPageWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import AccountBlockedUser from './AccountBlockedUser/AccountBlockedUser';
import AccountChangePassword from './AccountChangePassword/AccountChangePassword';
import AccountDelete from './AccountDelete/AccountDelete';
import AccountNotification from './AccountNotification/AccountNotification';
import AccountSettings from './AccountSettings/AccountSettings';

function Account() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Routes>
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/notifications" element={<AccountNotification />} />
          <Route path="/blocked-users" element={<AccountBlockedUser />} />
          <Route path="/change-password" element={<AccountChangePassword />} />
          <Route path="/delete-account" element={<AccountDelete />} />
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
