import React, { useState } from 'react';
import FollowingHeader from '../FollowingHeader';

function FollowingHashtags() {
  const [search, setSearch] = useState<string>('');
  return (
    <div>
      <FollowingHeader
        tabKey="hashtags"
        setSearch={setSearch}
        search={search}
      />
    </div>
  );
}

export default FollowingHashtags;
