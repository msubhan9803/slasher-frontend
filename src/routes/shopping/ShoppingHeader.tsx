import React from 'react';
import TabLinks from '../../components/ui/Tabs/TabLinks';

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'slasher-deal', label: 'Slasher deals' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'my-listings', label: 'My listings' },
];
function ShoppingHeader({ tabKey, changeTab }: any) {
  return (
    <TabLinks tabLink={tabs} setSelectedTab={changeTab} selectedTab={tabKey} className="px-md-4" />
  );
}

export default ShoppingHeader;
