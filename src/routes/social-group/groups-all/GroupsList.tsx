import React, { useState } from 'react';
import SocialGroupList from '../../../components/ui/SocialGroupList';
import { listAll } from '../SocialGroupListItem';
import SocialGroupsHeader from '../SocialGroupsHeader';

function GroupsList() {
  const [search, setSearch] = useState<string>('');
  const [sortVal, setSortVal] = useState<string>('recent-activity');
  const applyFilter = () => sortVal;
  return (
    <div>
      <SocialGroupsHeader
        tabKey="all"
        setSearch={setSearch}
        search={search}
        sort={(value:string) => setSortVal(value)}
        applyFilter={applyFilter}
        noFilter
      />
      <div className="mt-3">
        <SocialGroupList listItems={listAll} />
      </div>
    </div>
  );
}

export default GroupsList;
