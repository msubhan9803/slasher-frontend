import React from 'react';
import TabLinks from '../../components/ui/Tabs/TabLinks';

interface ShoppingHeaderProps {
  tabKey: string;
}
const tabs = [
  { value: 'all', label: 'All' },
  { value: 'slasher-deals', label: 'Slasher deals' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'my-listings', label: 'My listings' },
];
function ShoppingHeader({ tabKey }: ShoppingHeaderProps) {
  return (
    <TabLinks tabLink={tabs} toLink="/shopping" selectedTab={tabKey} />
  );
}

export default ShoppingHeader;
