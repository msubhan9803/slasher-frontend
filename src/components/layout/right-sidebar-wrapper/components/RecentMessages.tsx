import React from 'react';
import UserMessageList from '../../../ui/UserMessageList/UserMessageList';
import UserMessageSidebarListItem from '../../../ui/UserMessageList/UserMessageSidebarListItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

function RecentMessages() {
  const recentMessageDetails = [
    {
      id: 21, userName: 'Maureen Biologist', message: 'We ask only to be reassured We ask only to be reassured We ask only to be reassured', photo: 'https://i.pravatar.cc/300?img=47',
    },
    {
      id: 22, userName: 'Teri Dactyl', message: 'There was a knock ', photo: 'https://i.pravatar.cc/300?img=56',
    },
    {
      id: 23, userName: 'Teri Dactyl', message: 'There was a knock on the door and', photo: 'https://i.pravatar.cc/300?img=26',
    },
  ];
  return (
    <div className="mt-5">
      <SidebarHeaderWithLink headerLabel="Recent messages" linkLabel="View All" linkTo="/" />
      <UserMessageList className="mb-4">
        {recentMessageDetails.map((recentMessageDetail) => (
          <UserMessageSidebarListItem
            key={recentMessageDetail.id}
            userName={recentMessageDetail.userName}
            message={recentMessageDetail.message}
            count={6}
            image={recentMessageDetail.photo}
          />
        ))}
      </UserMessageList>
    </div>
  );
}

export default RecentMessages;
