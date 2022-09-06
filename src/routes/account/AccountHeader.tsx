import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const changeTab = (tab: string) => {
    navigate(`/account/${tab}`);
  };

  return (
    <TabLinks tabLink={tabs} setSelectedTab={changeTab} selectedTab={tabKey} className="px-md-4 justify-content-between" />
  );
}

export default AccountHeader;
