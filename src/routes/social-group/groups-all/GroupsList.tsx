import React, { useState } from 'react';
import SocialGroupListItem from '../../../components/ui/SocialGroupListItem';
import { listAll } from '../GroupsData';
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
        sort={(e: React.ChangeEvent<HTMLSelectElement>) => setSortVal(e.target.value)}
        applyFilter={applyFilter}
        noFilter
      />
      <div className="mt-3">
        <SocialGroupListItem listItems={listAll} />
      </div>
    </div>
  );
}

export default GroupsList;
