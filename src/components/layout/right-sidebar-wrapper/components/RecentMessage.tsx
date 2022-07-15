import React from 'react';
import UserMessageList from '../../../ui/UserMessageList/UserMessageList';
import UserMessageListItem from '../../../ui/UserMessageList/UserMessageListItem';

function RecentMessage() {
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
    <>
      <div className="d-flex align-items-end justify-content-between mt-4 mb-2">
        <h3 className="h4 mb-0">Recent messages</h3>
        <small className="text-primary">View All</small>
      </div>
      <UserMessageList className="mb-4">
        {recentMessageDetails.map((recentMessageDetail) => (
          <UserMessageListItem
            key={recentMessageDetail.id}
            userName={recentMessageDetail.userName}
            message={recentMessageDetail.message}
            count={6}
            image={recentMessageDetail.photo}
          />
        ))}
      </UserMessageList>

    </>
  );
}

export default RecentMessage;
