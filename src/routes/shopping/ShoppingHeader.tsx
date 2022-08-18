import React from 'react';
import TabLinks from '../../components/ui/Tabs/TabLinks';

interface ShoppingHeaderProps {
  tabKey: string;
  changeTab: (value: string) => void;
}
const tabs = [
  { value: 'all', label: 'All' },
  { value: 'slasher-deals', label: 'Slasher deals' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'my-listings', label: 'My listings' },
];
function ShoppingHeader({ tabKey, changeTab }: ShoppingHeaderProps) {
  return (
    <TabLinks tabLink={tabs} setSelectedTab={changeTab} selectedTab={tabKey} className="px-md-4" />
  );
}

export default ShoppingHeader;
