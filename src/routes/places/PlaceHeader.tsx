import React from 'react';
import TabLinks from '../../components/ui/Tabs/TabLinks';

const tabs = [
  { value: 'location', label: 'By location' },
  { value: 'category', label: 'By category' },
  { value: 'newest', label: 'Newest' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'my-places', label: 'My places' },
];
function PlaceHeader({
  tabKey, changeTab,
}: any) {
  return (
    <TabLinks tabLink={tabs} setSelectedTab={changeTab} selectedTab={tabKey} className="px-md-4 justify-content-between" />
  );
}

export default PlaceHeader;
