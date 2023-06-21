import React from 'react';
import TabLinks from '../../components/ui/Tabs/TabLinks';

interface AccountHeaderProps {
  tabKey: string;
}
const tabs = [
  // { value: 'notifications', label: 'Notifications' },
  { value: 'blocked-users', label: 'Blocked users' },
  { value: 'change-password', label: 'Change password' },
  { value: 'sign-out', label: 'Sign out' },
  { value: 'delete-account', label: 'Delete account' },
];
function AccountHeader({ tabKey }: AccountHeaderProps) {
  return (
    <TabLinks tabLink={tabs} toLink="/app/account" selectedTab={tabKey} />
  );
}

export default AccountHeader;
