import React from 'react';
import { useAppSelector } from '../../../../redux/hooks';
import UserMessageList from '../../../ui/UserMessageList/UserMessageList';
import UserMessageSidebarListItem from '../../../ui/UserMessageList/UserMessageSidebarListItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

interface RecentMessage {
  latestMessage: string;
  unreadCount: number;
  user: {
    /* eslint no-underscore-dangle: 0 */
    _id: string;
    userName: string;
    profilePic: string;
  }
}

function RecentMessages() {
  const recentMessageDetails = useAppSelector((state) => state.user.recentMessages);
  return (
    <div className="mt-5">
      <SidebarHeaderWithLink headerLabel="Recent messages" linkLabel="View All" linkTo="/" />
      <UserMessageList className="mb-4">
        {recentMessageDetails && recentMessageDetails.length > 0
          && recentMessageDetails.map((recentMessageDetail: RecentMessage) => (
            <UserMessageSidebarListItem
              /* eslint no-underscore-dangle: 0 */
              key={recentMessageDetail.user._id}
              userName={recentMessageDetail.user.userName}
              message={recentMessageDetail.latestMessage}
              count={recentMessageDetail.unreadCount}
              image={recentMessageDetail.user.profilePic}
            />
          ))}
      </UserMessageList>
    </div>
  );
}

export default RecentMessages;
