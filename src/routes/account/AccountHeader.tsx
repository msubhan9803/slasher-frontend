import React from 'react';
import TabLinks from '../../components/ui/Tabs/TabLinks';

interface AccountHeaderProps {
  tabKey: string;
}
const tabs = [
  { value: 'settings', label: 'Settings' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'blocked-users', label: 'Blocked users' },
  { value: 'change-password', label: 'Change password' },
  { value: 'delete-account', label: 'Delete account' },
];
function AccountHeader({ tabKey }: AccountHeaderProps) {
  return (
    <TabLinks tabLink={tabs} toLink="/account" selectedTab={tabKey} />
  );
}

export default AccountHeader;
