import React from 'react';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import AccountHeader from '../AccountHeader';

const LogoutButton = styled(RoundButton)`
  display: inline-block;
  white-space: nowrap;
  border: 0.063rem solid #3A3B46;
  &:hover {
  border: 0.063rem solid #3A3B46;
  }
`;
function AccountSettings() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <AccountHeader tabKey="settings" />
      <div className="mt-4">
        <p className="fs-5">Select one of the options above.</p>
        <LogoutButton className="bg-black fs-3 mt-3 px-5 text-center shadow-none text-white px-2">
          Logout
        </LogoutButton>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default AccountSettings;
