/* eslint-disable max-lines */
import React, {
  useEffect, useRef, useState,
} from 'react';
import Cookies from 'js-cookie';
import {
  useLocation, useNavigate, useParams, useSearchParams,
} from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import { DateTime } from 'luxon';
import Chat from '../../components/chat/Chat';
import { getConversation, createOrFindConversation } from '../../api/messages';
import NotFound from '../../components/NotFound';
import useGlobalSocket from '../../hooks/useGlobalSocket';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';

function Conversation() {
  const userId = Cookies.get('userId');
  const { conversationId } = useParams();
  const lastConversationIdRef = useRef('');
  const [chatUser, setChatUser] = useState<any>();
  const [messageList, setMessageList] = useState<any>([]);
  const { socket, socketConnected } = useGlobalSocket();
  const [message, setMessage] = useState('');
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [showPageDoesNotExist, setPageDoesNotExist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (location.pathname.includes('/new')) {
      const newConversationUserId = searchParams.get('userId');
      if (newConversationUserId) {
        createOrFindConversation(newConversationUserId).then((res) => {
          // eslint-disable-next-line no-underscore-dangle
          navigate(location.pathname.replace('/new', `/${res.data._id}`), { replace: true });
        }).catch((e) => { throw e; });
      } else {
        navigate('/messages', { replace: true });
      }
    }
  }, []);

  const onChatMessageReceivedHandler = (payload: any) => {
    const chatreceivedObj = {
      // eslint-disable-next-line no-underscore-dangle
      id: payload.user._id,
      message: payload.message,
      time: DateTime.now().toISO().toString(),
      participant: 'other',
    };
    setMessageList((prev: any) => [
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
    if (conversationId && !location.pathname.includes('new')) {
      const isSameConversation = lastConversationIdRef.current === conversationId;
      if (isSameConversation) return;

      lastConversationIdRef.current = conversationId;

<<<<<<< Updated upstream
      getConversation(conversationId).then((res) => {
        setIsLoading(false);

        setMessageList([]);
=======
      getMatchIdDetail(conversationId).then((res) => {
        setIsLoading(false);

        setRecentMessageList([]);
>>>>>>> Stashed changes
        // eslint-disable-next-line no-underscore-dangle, max-len
        const userDetail = res.data.participants.find((participant: any) => participant._id !== userId);
        setChatUser(userDetail);
        setRequestAdditionalPosts(true);

        // We need to set `loadingMessages` to false only if its not false currently.
        // Why?
        // 1. Consider messages for conversation1 is already loading, then if we change
        // conversation then do want to set `loadingMessages` to false so that messages
        // are loaded in the ```other useEffect``` hook.
        // 2. Consider page load event, so at that time `loadingMessages` is already
        // false so if we set it to false again then it would set messages twice
        // unnecessarily becoz the ```other useEffect``` depends on `loadingMessages` state.
        if (loadingMessages) setLoadingMessages(false);
      }).catch(() => {
        setIsLoading(false);
        setPageDoesNotExist(true);
      });
    }
  }, [conversationId]);

  const sendMessageClick = () => {
    // eslint-disable-next-line no-underscore-dangle
    socket?.emit('chatMessage', { message, toUserId: chatUser?._id }, (chatMessageResponse: any) => {
      if (chatMessageResponse.success) {
        setMessageList((prev: any) => [
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
    if (requestAdditionalPosts && !loadingMessages) {
      setNoMoreData(false);
      if (conversationId) {
        setLoadingMessages(true);
        socket?.emit('getMessages', { matchListId: conversationId, before: messageList.length > 0 ? messageList[0].id : undefined }, (getMessagesResponse: any) => {
          /* We need to check conversationId before setting `messageList`
          (Why? Ans. If we don't check for this we end up setting `messageList`
          for a previous conversation in a newer conversation when we rapidly switch
          between two conversations. (TESTED) */
          if (lastConversationIdRef.current !== conversationId) return;

          const newMessages = getMessagesResponse.map((newMessage: any) => {
            const finalData: any = {
              // eslint-disable-next-line no-underscore-dangle
              id: newMessage._id,
              message: newMessage.message,
              time: newMessage.createdAt,
            };
            if (newMessage.fromId === userId) {
              finalData.participant = 'self';
            } else {
              finalData.participant = 'other';
            }
            return finalData;
          }).reverse();
          setMessageList((prev: any) => [
            ...newMessages,
            ...prev,
          ]);
          if (getMessagesResponse.length === 0) { setNoMoreData(true); }
          if (newMessages.length === 0) {
            setRequestAdditionalPosts(false);
          }
          setLoadingMessages(false);
        });
      }
    }
  }, [conversationId, requestAdditionalPosts, messageList, loadingMessages]);

  if (isLoading || !socketConnected) return null;

  if (showPageDoesNotExist) {
    return (
      <NotFound />
    );
  }

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <InfiniteScroll
          pageStart={0}
          initialLoad
          loadMore={() => { setRequestAdditionalPosts(true); }}
          hasMore={!noMoreData}
          isReverse
        >
          <Chat
            messages={messageList}
            userData={chatUser}
            sendMessageClick={sendMessageClick}
            setMessage={setMessage}
            message={message}
          />
        </InfiniteScroll>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default Conversation;
