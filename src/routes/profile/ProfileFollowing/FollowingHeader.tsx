import React from 'react';
import SearchHeader from '../../search/SearchHeader';

function FollowingHeader({
  tabKey, setSearch, search,
}: any) {
  return (
    <div className="">
      <SearchHeader
        tabKey={tabKey}
        label="Search..."
        setSearch={setSearch}
        search={search}
      />
    </div>
  );
}

export default FollowingHeader;
