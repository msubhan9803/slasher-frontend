/* eslint-disable max-lines */
import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { DateTime } from 'luxon';
import { getMessagesList } from '../../api/messages';
import UserMessageListItem from '../../components/ui/UserMessageList/UserMessageListItem';
import { MessagesList, Message } from '../../types';
import MessagesOptionDialog from './MessagesOptionDialog';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { resetUnreadConversationCount } from '../../redux/slices/userSlice';
import socketStore from '../../socketStore';
import { createBlockUser } from '../../api/blocks';

function Messages() {
  const [requestAdditionalMessages, setRequestAdditionalMessages] = useState<boolean>(false);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageOptionValue, setMessageOptionValue] = useState('');
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const userId = useAppSelector((state) => state.user.user.id);
  const messageContainerElementRef = useRef<any>(null);
  const [yPositionOfLastMessageElement, setYPositionOfLastMessageElement] = useState<number>(0);
  const [selectedMatchListId, setSelectedMatchListId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { socket } = socketStore;

  const handleMessagesOption = (message: Message) => (messageOption: string) => {
    if (messageOption !== 'markAsRead') {
      setShow(true);
    }
    setMessageOptionValue(messageOption);
    setSelectedMatchListId(message._id);
    setSelectedUserId(message.userId);
  };

  useEffect(() => {
    if (requestAdditionalMessages && !loadingChats) {
      setLoadingChats(true);
      getMessagesList(
        messages.length > 0 ? messages[messages.length - 1]._id : undefined,
      ).then((res) => {
        const newMessages = res.data.map((data: any) => {
          const userDetail = data.participants.find(
            (participant: any) => participant._id !== userId,
          );
          const message: Message = {
            _id: data._id,
            userId: userDetail!._id,
            unreadCount: data.unreadCount,
            latestMessage: data.latestMessage,
            userName: userDetail!.userName,
            profilePic: userDetail!.profilePic,
            updatedAt: data.updatedAt,
          };
          return message;
        });
        setMessages((prev) => [
          ...prev,
          ...newMessages,
        ]);
        if (res.data.length === 0) { setNoMoreData(true); }
      }).catch(
        (error) => {
          setNoMoreData(true);
          setErrorMessage(error.response.data.message);
        },
      ).finally(
        () => { setRequestAdditionalMessages(false); setLoadingChats(false); },
      );
    }
  }, [requestAdditionalMessages, loadingChats, messages, userId]);

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        messages.length === 0
          ? 'No messages'
          : 'No more messages'
      }
    </p>
  );

  const fetchMoreMessages = useCallback(() => {
    getMessagesList()
      .then((res) => {
        const newMessages = res.data.map((data: MessagesList) => {
          const userDetail = data.participants.find(
            (participant: any) => participant._id !== userId,
          );
          const message: Message = {
            _id: data._id,
            userId: userDetail!._id,
            unreadCount: data.unreadCount,
            latestMessage: data.latestMessage,
            userName: userDetail!.userName,
            profilePic: userDetail!.profilePic,
            updatedAt: data.updatedAt,
          };
          return message;
        });
        setMessages(newMessages);
      })
      .catch((error) => setErrorMessage(error.response.data.message));
  }, [userId]);
  const getYPosition = () => {
    const yPosition = messageContainerElementRef.current?.lastElementChild?.offsetTop;
    setYPositionOfLastMessageElement(yPosition);
  };
  useEffect(() => {
    getYPosition();
  }, [messages]);

  useEffect(() => {
    if (yPositionOfLastMessageElement) {
      const bottomLine = window.scrollY + window.innerHeight > yPositionOfLastMessageElement;
      if (bottomLine) {
        fetchMoreMessages();
      }
    }
  }, [yPositionOfLastMessageElement, fetchMoreMessages]);

  useEffect(() => {
    socket?.emit('clearNewConversationIds', {});
    dispatch(resetUnreadConversationCount());
  }, [dispatch, socket]);
  const onBlockYesClick = () => {
    createBlockUser(selectedUserId!)
      .then(() => {
        setShow(false);
        // remove blocked user message
        setMessages((prev) => prev.filter((m) => m.userId !== selectedUserId));
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <div className="mb-3">
          <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
          <InfiniteScroll
            threshold={500}
            pageStart={0}
            initialLoad
            loadMore={() => { setRequestAdditionalMessages(true); }}
            hasMore={!noMoreData}
          >
            {
              messages.length > 0
              && messages.map((message) => (
                <UserMessageListItem
                  key={message._id}
                  ref={messageContainerElementRef}
                  image={message.profilePic}
                  userName={message.userName}
                  message={message.latestMessage}
                  count={message.unreadCount}
                  timeStamp={DateTime.fromISO(message.updatedAt).toFormat('MM/dd/yyyy t')}
                  handleDropdownOption={handleMessagesOption(message)}
                  matchListId={message._id}
                />
              ))
            }
          </InfiniteScroll>
        </div>
        {loadingChats && <LoadingIndicator />}
        {noMoreData && renderNoMoreDataMessage()}
        <MessagesOptionDialog
          show={show}
          setShow={setShow}
          slectedMessageDropdownValue={messageOptionValue}
          selectedMatchListId={selectedMatchListId}
          setMessages={setMessages}
          onBlockYesClick={onBlockYesClick}
        />
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default Messages;
