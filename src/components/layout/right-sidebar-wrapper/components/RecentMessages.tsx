import React from 'react';
import { useAppSelector } from '../../../../redux/hooks';
import UserMessageList from '../../../ui/UserMessageList/UserMessageList';
import UserMessageSidebarListItem from '../../../ui/UserMessageList/UserMessageSidebarListItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

interface RecentMessage {
  profilePic: string;
  shortMessage: string;
  userName: string;
}

function RecentMessages() {
  const recentMessageDetails = useAppSelector((state) => state?.user?.recentMessages);
  return (
    <div className="mt-5">
      <SidebarHeaderWithLink headerLabel="Recent messages" linkLabel="View All" linkTo="/" />
      <UserMessageList className="mb-4">
        {recentMessageDetails && recentMessageDetails.length > 0
          && recentMessageDetails.map((recentMessageDetail: RecentMessage) => (
            <UserMessageSidebarListItem
              key={recentMessageDetail.userName}
              userName={recentMessageDetail.userName}
              message={recentMessageDetail.shortMessage}
              count={6}
              image={recentMessageDetail.profilePic}
            />
          ))}
      </UserMessageList>
    </div>
  );
}

export default RecentMessages;
