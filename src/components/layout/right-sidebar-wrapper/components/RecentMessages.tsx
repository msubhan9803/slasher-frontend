import React from 'react';
import { useAppSelector } from '../../../../redux/hooks';
import { UserMesssage } from '../../../../types';
import UserMessageList from '../../../ui/UserMessageList/UserMessageList';
import UserMessageSidebarListItem from '../../../ui/UserMessageList/UserMessageSidebarListItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

interface RecentMessage {
  latestMessage: string;
  unreadCount: number;
  participants: UserMesssage[];
  _id: string;
}

function RecentMessages() {
  const recentMessages = useAppSelector((state) => state.user.recentMessages);
  const userId = useAppSelector((state) => state.user.user.id);

  return (
    <div className="mt-5">
      {recentMessages && recentMessages.length > 0
        && (
        <>
          <SidebarHeaderWithLink headerLabel="Recent messages" linkLabel="View All" linkTo="/app/messages" />
          <UserMessageList className="mb-4">
            {recentMessages.map((recentMessageDetail: RecentMessage) => (
              <UserMessageSidebarListItem
                key={recentMessageDetail._id}
                userName={recentMessageDetail.participants!
                  .find((participant) => participant._id !== userId)!.userName}
                message={recentMessageDetail.latestMessage}
                count={recentMessageDetail.unreadCount}
                image={recentMessageDetail.participants
                  .find((participant) => participant._id !== userId)!.profilePic}
                messageId={recentMessageDetail._id}
              />
            ))}
          </UserMessageList>
        </>
        )}
    </div>
  );
}

export default RecentMessages;
