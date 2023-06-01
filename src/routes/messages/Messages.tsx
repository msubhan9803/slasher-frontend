/* eslint-disable max-lines */
import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { DateTime } from 'luxon';
import { getConversations } from '../../api/messages';
import UserMessageListItem from '../../components/ui/UserMessageList/UserMessageListItem';
import { MessagesList, ConversationListItem } from '../../types';
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
  const [
    requestAdditionalConversations, setRequestAdditionalConversations,
  ] = useState<boolean>(false);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [messageOptionValue, setMessageOptionValue] = useState('');
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const userId = useAppSelector((state) => state.user.user.id);
  const conversationsContainerElementRef = useRef<any>(null);
  const [
    yPositionOfLastConversationElement, setYPositionOfLastConversationElement,
  ] = useState<number>(0);
  const [selectedMatchListId, setSelectedMatchListId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { socket } = socketStore;

  const handleMessagesOption = (message: ConversationListItem) => (messageOption: string) => {
    if (messageOption !== 'markAsRead') {
      setShow(true);
    }
    setMessageOptionValue(messageOption);
    setSelectedMatchListId(message._id);
    setSelectedUserId(message.userId);
  };

  useEffect(() => {
    if (requestAdditionalConversations && !loadingConversations) {
      setLoadingConversations(true);
      getConversations(
        conversations.length > 0 ? conversations[conversations.length - 1]._id : undefined,
      ).then((res) => {
        const newConversations = res.data.map((data: any) => {
          const userDetail = data.participants.find(
            (participant: any) => participant._id !== userId,
          );
          const conversation: ConversationListItem = {
            _id: data._id,
            userId: userDetail!._id,
            unreadCount: data.unreadCount,
            latestMessage: data.latestMessage,
            userName: userDetail!.userName,
            profilePic: userDetail!.profilePic,
            updatedAt: data.updatedAt,
          };
          return conversation;
        });
        setConversations((prev) => [
          ...prev,
          ...newConversations,
        ]);
        if (res.data.length === 0) { setNoMoreData(true); }
      }).catch(
        (error) => {
          setNoMoreData(true);
          setErrorMessage(error.response.data.message);
        },
      ).finally(
        () => { setRequestAdditionalConversations(false); setLoadingConversations(false); },
      );
    }
  }, [requestAdditionalConversations, loadingConversations, conversations, userId]);

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        conversations.length === 0
          ? 'No messages'
          : 'No more messages'
      }
    </p>
  );

  const fetchMoreConversations = useCallback(() => {
    getConversations()
      .then((res) => {
        const newConversations = res.data.map((data: MessagesList) => {
          const userDetail = data.participants.find(
            (participant: any) => participant._id !== userId,
          );
          const conversation: ConversationListItem = {
            _id: data._id,
            userId: userDetail!._id,
            unreadCount: data.unreadCount,
            latestMessage: data.latestMessage,
            userName: userDetail!.userName,
            profilePic: userDetail!.profilePic,
            updatedAt: data.updatedAt,
          };
          return conversation;
        });
        setConversations(newConversations);
      })
      .catch((error) => setErrorMessage(error.response.data.message));
  }, [userId]);
  const getYPosition = () => {
    const yPosition = conversationsContainerElementRef.current?.lastElementChild?.offsetTop;
    setYPositionOfLastConversationElement(yPosition);
  };
  useEffect(() => {
    getYPosition();
  }, [conversations]);

  useEffect(() => {
    if (yPositionOfLastConversationElement) {
      const bottomLine = window.scrollY + window.innerHeight > yPositionOfLastConversationElement;
      if (bottomLine) {
        fetchMoreConversations();
      }
    }
  }, [yPositionOfLastConversationElement, fetchMoreConversations]);

  useEffect(() => {
    socket?.emit('clearNewConversationIds', {});
    dispatch(resetUnreadConversationCount());
  }, [dispatch, socket]);
  const onBlockYesClick = () => {
    createBlockUser(selectedUserId!)
      .then(() => {
        setShow(false);
        // remove blocked user conversation
        setConversations((prev) => prev.filter((m) => m.userId !== selectedUserId));
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
            loadMore={() => { setRequestAdditionalConversations(true); }}
            hasMore={!noMoreData}
          >
            {
              conversations.length > 0
              && conversations.map((conversation) => (
                <UserMessageListItem
                  key={conversation._id}
                  ref={conversationsContainerElementRef}
                  image={conversation.profilePic}
                  userName={conversation.userName}
                  message={conversation.latestMessage}
                  count={conversation.unreadCount}
                  timeStamp={DateTime.fromISO(conversation.updatedAt).toFormat('MM/dd/yyyy t')}
                  handleDropdownOption={handleMessagesOption(conversation)}
                  matchListId={conversation._id}
                />
              ))
            }
          </InfiniteScroll>
        </div>
        {loadingConversations && <LoadingIndicator />}
        {noMoreData && renderNoMoreDataMessage()}
        <MessagesOptionDialog
          show={show}
          setShow={setShow}
          slectedMessageDropdownValue={messageOptionValue}
          selectedMatchListId={selectedMatchListId}
          setMessages={setConversations}
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
