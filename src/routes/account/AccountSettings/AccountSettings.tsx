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
      // TODO: Temporary fixed
      // Later we need to make use of `NOT_FOUND` with status code in backend and
      // then handle it accordingly here because we don't want to call `clearUserSession`
      // when in case the `signOut` request fails due to loss internet connection.
      // Ideally we should not call the DELETE endpoint and throw 404 NOT_FOUND error
      // when the resource doesn't exist and only in that case we should call `clearUserSession`
      // because if not `catch` callback executes when there is NO_INTERNET (and we want to
      // avoid that.).
    }).catch(clearUserSession);
  } else {
    clearUserSession();
  }
};

function AccountSettings() {
  return (
    <div>
      <AccountHeader tabKey="sign-out" />
      <div className="mt-4">
        <SignOutButton onClick={() => userSignOut()} className="bg-black mt-3 px-5 text-center shadow-none text-white">
          Sign Out
        </SignOutButton>
      </div>
    </div>
  );
}

export default AccountSettings;
