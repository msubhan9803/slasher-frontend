import React, { useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import { DateTime } from 'luxon';
import Chat from '../../components/chat/Chat';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import { getMatchIdDetail } from '../../api/messages';
import { SocketContext } from '../../context/socket';

function Conversation() {
  const userId = Cookies.get('userId');
  const { conversationId } = useParams();
  const [chatUser, setChatUser] = useState<any>();
  const [recentMessageList, setRecentMessageList] = useState<any>([]);
  const socket = useContext(SocketContext);
  const [message, setMessage] = useState('');
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);

  const onChatMessageReceivedHandler = (payload: any) => {
    const chatreceivedObj = {
      // eslint-disable-next-line no-underscore-dangle
      id: payload.user._id,
      message: payload.message,
      time: DateTime.now().toISO().toString(),
      participant: 'other',
    };
    setRecentMessageList((prev: any) => [
      ...prev,
      chatreceivedObj,
    ]);
  };

  useEffect(() => {
    if (socket) {
      socket.on('chatMessageReceived', onChatMessageReceivedHandler);
      return () => {
        socket.off('chatMessageReceived', onChatMessageReceivedHandler);
      };
    }
    return () => { };
  }, []);

  useEffect(() => {
    if (conversationId) {
      setRecentMessageList([]);
      getMatchIdDetail(conversationId).then((res) => {
        // eslint-disable-next-line no-underscore-dangle, max-len
        const userDetail = res.data.participants.find((participant: any) => participant._id !== userId);
        setChatUser(userDetail);
        setRequestAdditionalPosts(true);
      });
    }
  }, [conversationId]);

  const sendMessageClick = () => {
    // eslint-disable-next-line no-underscore-dangle
    socket?.emit('chatMessage', { message, toUserId: chatUser?._id }, (chatMessageResponse: any) => {
      if (chatMessageResponse.success) {
        setRecentMessageList((prev: any) => [
          ...prev,
          {
            // eslint-disable-next-line no-underscore-dangle
            id: chatMessageResponse.message._id,
            message: chatMessageResponse.message.message,
            time: chatMessageResponse.message.createdAt,
            participant: 'self',
          },
        ]);
        setMessage('');
      }
    });
  };

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      setNoMoreData(false);
      if (conversationId) {
        socket?.emit('recentMessages', { matchListId: conversationId, before: recentMessageList.length > 0 ? recentMessageList[0].id : undefined }, (recentMessagesResponse: any) => {
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
          setRecentMessageList((prev: any) => [
            ...messageList,
            ...prev,
          ]);
          if (recentMessagesResponse.length === 0) { setNoMoreData(true); }
          if (messageList.length === 0) {
            setRequestAdditionalPosts(false);
            setLoadingPosts(false);
          }
        });
      }
    }
  }, [conversationId, requestAdditionalPosts, recentMessageList, loadingPosts]);

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <InfiniteScroll
        pageStart={0}
        initialLoad
        loadMore={() => { setRequestAdditionalPosts(true); }}
        hasMore={!noMoreData}
        isReverse
      >
        <Chat
          messages={recentMessageList}
          userData={chatUser}
          sendMessageClick={sendMessageClick}
          setMessage={setMessage}
          message={message}
        />
      </InfiniteScroll>
    </AuthenticatedPageWrapper>
  );
}

export default Conversation;
