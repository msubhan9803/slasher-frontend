import React from 'react';
import FriendRequestItem from './FriendRequestItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

const friendRequests = [
  { id: 1, image: 'https://i.pravatar.cc/300?img=19', userName: 'Maureen Biologist' },
  { id: 2, image: 'https://i.pravatar.cc/300?img=20', userName: 'Bernadette Audrey' },
  { id: 3, image: 'https://i.pravatar.cc/300?img=09', userName: 'Stephanie Sue' },
];

function FriendRequests() {
  return (
    <div className="mt-5">
      <SidebarHeaderWithLink headerLabel="Friend requests" linkLabel="View All" linkTo="/" />
      {friendRequests.map((request, i) => (
        <FriendRequestItem
          key={request.id}
          className={i + 1 < friendRequests.length ? 'mb-3' : ''}
          id={request.id}
          image={request.image}
          userName={request.userName}
        />
      ))}
    </div>
  );
}

export default FriendRequests;
