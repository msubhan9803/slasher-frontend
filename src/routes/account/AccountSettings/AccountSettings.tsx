import React from 'react';
import styled from 'styled-components';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import RoundButton from '../../../components/ui/RoundButton';
import { signOut } from '../../../utils/session-utils';
import AccountHeader from '../AccountHeader';

const SignOutButton = styled(RoundButton)`
  display: inline-block;
  white-space: nowrap;
  border: 1px solid #3A3B46;
  &:hover {
  border: 1px solid #3A3B46;
  }
`;
function AccountSettings() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <AccountHeader tabKey="settings" />
        <div className="mt-4">
          <p className="fs-5">Select one of the options above.</p>
          <SignOutButton onClick={signOut} className="bg-black fs-3 mt-3 px-5 text-center shadow-none text-white px-2">
            Sign Out
          </SignOutButton>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default AccountSettings;
