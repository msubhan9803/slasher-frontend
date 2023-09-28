import React from 'react';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import { useAppSelector } from '../../redux/hooks';
import { UserType } from '../../types';

interface AccountHeaderProps {
  tabKey: string;
}
const regularTtabs = [
  { value: 'notifications', label: 'Notifications' },
  { value: 'blocked-users', label: 'Blocked users' },
  { value: 'change-password', label: 'Change password' },
  { value: 'sign-out', label: 'Sign out' },
  { value: 'delete-account', label: 'Delete account' },
];
const adminTab = { value: 'admin', label: 'Admin' };

function AccountHeader({ tabKey }: AccountHeaderProps) {
  const user = useAppSelector((state) => state.user);
  const isAdmin = user.user.userType === UserType.Admin;
  const tabs = isAdmin ? [...regularTtabs, adminTab] : regularTtabs;

  return (
    <TabLinks tabLink={tabs} toLink="/app/account" selectedTab={tabKey} />
  );
}

export default AccountHeader;
