import React from 'react';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import { clearUserSession } from '../../../utils/session-utils';
import AccountHeader from '../AccountHeader';
import { isNativePlatform } from '../../../constants';
import { signOut } from '../../../api/users';

const SignOutButton = styled(RoundButton)`
  display: inline-block;
  white-space: nowrap;
  border: 1px solid #3A3B46;
  &:hover {
  border: 1px solid #3A3B46;
  }
`;

const userSignOut = () => {
  if (isNativePlatform) {
    signOut().then(async (res) => {
      if (res.data.success) { clearUserSession(); }
    });
  } else {
    clearUserSession();
  }
};

function AccountSettings() {
  return (
    <div>
      <AccountHeader tabKey="sign-out" />
      <div className="mt-4">
        <SignOutButton onClick={userSignOut()} className="bg-black mt-3 px-5 text-center shadow-none text-white">
          Sign Out
        </SignOutButton>
      </div>
    </div>
  );
}

export default AccountSettings;
