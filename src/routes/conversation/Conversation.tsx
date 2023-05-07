/* eslint-disable max-lines */
import React, {
  ChangeEvent,
  useCallback,
  useEffect, useRef, useState,
} from 'react';
import {
  useLocation, useNavigate, useParams, useSearchParams,
} from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import { DateTime } from 'luxon';
import Chat from '../../components/chat/Chat';
import {
  getConversation, createOrFindConversation, attachFile, markAllReadForSingleConversation,
} from '../../api/messages';
import NotFound from '../../components/NotFound';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import { useAppSelector } from '../../redux/hooks';
import socketStore from '../../socketStore';

function Conversation() {
  const userId = useAppSelector((state) => state.user.user.id);
  const { conversationId } = useParams();
  const lastConversationIdRef = useRef('');
  const [chatUser, setChatUser] = useState<any>();
  const [messageList, setMessageList] = useState<any>([]);
  const { socket } = socketStore;
  const [message, setMessage] = useState('');
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [showPageDoesNotExist, setPageDoesNotExist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [imageArray, setImageArray] = useState<any>([]);
  const [uploadPost, setUploadPost] = useState<string[]>([]);
  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const isSocketConnected = useAppSelector((state) => state.socket.isConnected);
  const isKeyboardOpen = useAppSelector((state) => state.user.isKeyboardOpen);

  useEffect(() => {
    if (location.pathname.includes('/new')) {
      const newConversationUserId = searchParams.get('userId');
      if (newConversationUserId) {
        createOrFindConversation(newConversationUserId).then((res) => {
          navigate(location.pathname.replace('/new', `/${res.data._id}`), { replace: true });
        }).catch((e) => { throw e; });
      } else {
        navigate('/app/messages', { replace: true });
      }
    }
  }, [location.pathname, navigate, searchParams]);

  const onChatMessageReceivedHandler = useCallback((payload: any) => {
    const chatreceivedObj = {
      id: payload.message.fromId,
      message: payload.message.message,
      time: DateTime.now().toISO().toString(),
      participant: 'other',
      image: payload.message.image ?? null,
    };
    if (payload.message.matchId === conversationId) {
      socket!.emit('messageRead', { messageId: payload.message._id });
      setMessageList((prev: any) => [
        ...prev,
        chatreceivedObj,
      ]);
    }
  }, [conversationId, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('chatMessageReceived', onChatMessageReceivedHandler);
      return () => {
        socket.off('chatMessageReceived', onChatMessageReceivedHandler);
      };
    }
    return () => { };
  }, [onChatMessageReceivedHandler, socket]);

  useEffect(() => {
    if (conversationId === 'new') { return; }
    markAllReadForSingleConversation(conversationId!);
  }, [conversationId]);

  useEffect(() => {
    if (conversationId && !location.pathname.includes('new')) {
      const isSameConversation = lastConversationIdRef.current === conversationId;
      if (isSameConversation) { return; }

      lastConversationIdRef.current = conversationId;

      getConversation(conversationId).then((res) => {
        setIsLoading(false);

        setMessageList([]);
        // eslint-disable-next-line max-len
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
        if (loadingMessages) { setLoadingMessages(false); }
      }).catch(() => {
        setIsLoading(false);
        setPageDoesNotExist(true);
      });
    }
  }, [conversationId, loadingMessages, location.pathname, userId]);

  const sendMessageClick = () => {
    if (imageArray.length > 0) {
      setMessageLoading(true);
      attachFile(message, imageArray, conversationId!)
        .then((res) => {
          res.data.messages.map((sentMessage: any) => {
            setMessageList((prev: any) => [
              ...prev,
              {
                id: sentMessage._id,
                message: sentMessage.message,
                time: sentMessage.createdAt,
                participant: 'self',
                image: sentMessage.image ?? null,
              },
            ]);
            setMessageLoading(false);
            return null;
          });
          setMessage('');
          setImageArray([]);
        }).catch(
          () => {
            setMessageLoading(false);
          },
        );
    } else if (message.length > 0) {
      socket?.emit('chatMessage', { message, toUserId: chatUser?._id }, (chatMessageResponse: any) => {
        if (chatMessageResponse.success) {
          setMessageList((prev: any) => [
            ...prev,
            {
              id: chatMessageResponse.message._id,
              message: chatMessageResponse.message.message,
              time: chatMessageResponse.message.createdAt,
              participant: 'self',
              image: chatMessageResponse.message.image ?? null,
            },
          ]);
          setMessage('');
        }
      });
    }
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
          if (lastConversationIdRef.current !== conversationId) { return; }

          const newMessages = getMessagesResponse.map((newMessage: any) => {
            const finalData: any = {
              id: newMessage._id,
              message: newMessage.message,
              time: newMessage.createdAt,
              image: newMessage.image ? newMessage.image : null,
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
  }, [conversationId, requestAdditionalPosts, messageList, loadingMessages, socket, userId]);

  if (isLoading || !isSocketConnected) { return null; }

  if (showPageDoesNotExist) {
    return (
      <NotFound />
    );
  }

  const handleFileChange = (postImage: ChangeEvent<HTMLInputElement>) => {
    if (!postImage.target) {
      return;
    }
    if (postImage.target.name === 'post' && postImage.target && postImage.target.files) {
      const uploadedPostList = [...uploadPost];
      const imageArrayList = [...imageArray];
      const fileList = postImage.target.files;
      for (let list = 0; list < fileList.length; list += 1) {
        if (uploadedPostList.length < 10) {
          const image = URL.createObjectURL(postImage.target.files[list]);
          uploadedPostList.push(image);
          imageArrayList.push(postImage.target.files[list]);
        }
      }
      setUploadPost(uploadedPostList);
      setImageArray(imageArrayList);
    }
  };

  const handleRemoveFile = (postImage: File) => {
    const removePostImage = imageArray.filter((image: File) => image !== postImage);
    setImageArray(removePostImage);
  };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper $isKeyboardOpen={isKeyboardOpen}>
        <InfiniteScroll
          className="balla"
          pageStart={0}
          initialLoad
          loadMore={() => { setRequestAdditionalPosts(true); }}
          hasMore={!noMoreData}
          isReverse
          style={{ height: isKeyboardOpen ? '98vh' : 'auto' }}
        >
          <Chat
            messages={messageList}
            userData={chatUser}
            sendMessageClick={sendMessageClick}
            setMessage={setMessage}
            message={message}
            handleFileChange={handleFileChange}
            handleRemoveFile={handleRemoveFile}
            imageArray={imageArray}
            messageLoading={messageLoading}
          />
        </InfiniteScroll>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default Conversation;
