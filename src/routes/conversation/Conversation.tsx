import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { apiUrl } from '../../api/constants';
import Chat from '../../components/chat/Chat';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import { getUser } from '../../api/users';
import { User } from '../../types';

const token = Cookies.get('sessionToken');
const userId = Cookies.get('userId');
const socket = io(apiUrl!, {
  transports: ['websocket'],
  auth: { token },
});

function Conversation() {
  const { conversationId, chatUserId } = useParams();
  const [chatUser, setChatUser] = useState<User>();
  const [recentMessageList, setRecentMessageList] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected');
    });

    socket.once('authSuccess', (payload) => {
      console.log('payload =', payload);
    });

    socket.on('disconnect', () => {
      console.log('disconnected');
    });
  }, []);

  useEffect(() => {
    if (conversationId) {
      socket.emit('recentMessages', { matchListId: conversationId }, (recentMessagesResponse: any) => {
        const messageList = recentMessagesResponse.map((recentMessage: any) => {
          const finalData: any = {
            // eslint-disable-next-line no-underscore-dangle
            id: recentMessage._id,
            message: recentMessage.message,
            time: recentMessage.createdAt,
          };
          if (recentMessage.fromId === userId) {
            finalData.participant = 'self';
          } else {
            finalData.participant = 'other';
          }
          return finalData;
        });
        console.log('messageList =', messageList);
        setRecentMessageList(messageList);
      });
    }
  }, [conversationId]);

  useEffect(() => {
    if (chatUserId) {
      getUser(chatUserId)
        .then((res) => {
          setChatUser(res.data);
        });
    }
  }, [chatUserId]);

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <Chat messages={recentMessageList} userData={chatUser} />
    </AuthenticatedPageWrapper>
  );
}

export default Conversation;
