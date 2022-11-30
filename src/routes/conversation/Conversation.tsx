import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import { apiUrl } from '../../api/constants';
import Chat from '../../components/chat/Chat';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import { getMatchIdDetail } from '../../api/messages';

const token = Cookies.get('sessionToken');
const userId = Cookies.get('userId');
const socket = io(apiUrl!, {
  transports: ['websocket'],
  auth: { token },
});

function Conversation() {
  const { conversationId } = useParams();
  const [chatUser, setChatUser] = useState<any>();
  const [recentMessageList, setRecentMessageList] = useState([]);
  const [chatSendSuccess, setChatSendSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState('');

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

    socket.on('chatMessageReceived', (payload) => {
      console.log('chatMessageReceived payload =', payload);
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
        }).reverse();
        console.log('messageList =', messageList);
        setRecentMessageList(messageList);
      });

      getMatchIdDetail(conversationId).then((res) => {
        // eslint-disable-next-line no-underscore-dangle, max-len
        const userDetail = res.data.participants.find((participant: any) => participant._id !== userId);
        setChatUser(userDetail);
      });
    }
  }, [conversationId, chatSendSuccess]);

  const sendMessageClick = () => {
    // eslint-disable-next-line no-underscore-dangle
    socket.emit('chatMessage', { message, toUserId: chatUser?._id }, (chatMessageResponse: any) => {
      // const messageList = recentMessagesResponse.map((recentMessage: any) => {
      //   const finalData: any = {
      //     // eslint-disable-next-line no-underscore-dangle
      //     id: recentMessage._id,
      //     message: recentMessage.message,
      //     time: recentMessage.createdAt,
      //   };
      //   if (recentMessage.fromId === userId) {
      //     finalData.participant = 'self';
      //   } else {
      //     finalData.participant = 'other';
      //   }
      //   return finalData;
      // });
      console.log('chatMessageResponse =', chatMessageResponse);
      if (chatMessageResponse.success) {
        setMessage('');
        setChatSendSuccess(true);
      }
      // setRecentMessageList(messageList);
    });
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      {/* <InfiniteScroll
        pageStart={0}
        initialLoad
        loadMore={() => { setRequestAdditionalPosts(true); }}
        hasMore={!noMoreData}
        isReverse
      > */}
      <Chat
        messages={recentMessageList}
        userData={chatUser}
        sendMessageClick={sendMessageClick}
        setMessage={setMessage}
        message={message}
      />
      {/* </InfiniteScroll> */}
    </AuthenticatedPageWrapper>
  );
}

export default Conversation;
