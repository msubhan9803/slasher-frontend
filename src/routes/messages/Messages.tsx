import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { DateTime } from 'luxon';
import { getMessagesList } from '../../api/messages';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import UserMessageListItem from '../../components/ui/UserMessageList/UserMessageListItem';
import { MessagesList } from '../../types';
import MessagesOptionDialog from './MessagesOptionDialog';

export interface NewMessagesList {
  unreadCount: number;
  latestMessage: string;
  _id: string;
  id: string;
  userName: string;
  profilePic: string;
  updatedAt: string;
}

function Messages() {
  const [requestAdditionalMessages, setRequestAdditionalMessages] = useState<boolean>(false);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState<NewMessagesList[]>([]);
  const [messageOptionValue, setMessageOptionValue] = useState('');
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();

  const handleMessagesOption = (messageOption: string) => {
    if (messageOption !== 'markAsRead') {
      setShow(true);
    }
    setMessageOptionValue(messageOption);
  };

  useEffect(() => {
    if (requestAdditionalMessages && !loadingChats) {
      setLoadingChats(true);
      getMessagesList(
        messages.length > 1 ? messages[messages.length - 1]._id : undefined,
      ).then((res) => {
        const newMessages = res.data.map((data: MessagesList) => {
          /* eslint no-underscore-dangle: 0 */
          const message = {
            _id: data._id,
            id: data.user._id,
            unreadCount: data.unreadCount,
            latestMessage: data.latestMessage,
            userName: data.user.userName,
            profilePic: data.user.profilePic,
            updatedAt: data.updatedAt,
          };
          return message;
        });
        setMessages((prev: NewMessagesList[]) => [
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
  }, [requestAdditionalMessages, loadingChats]);

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        messages.length === 0
          ? 'No chats available'
          : 'No more chats'
      }
    </p>
  );

  const renderLoadingIndicator = () => (
    <p className="text-center">Loading...</p>
  );

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <div className="mb-3">
        {errorMessage && errorMessage.length > 0 && (
          <div className="mt-3 text-start">
            <ErrorMessageList errorMessages={errorMessage} className="m-0" />
          </div>
        )}
        <InfiniteScroll
          pageStart={0}
          initialLoad
          loadMore={() => { setRequestAdditionalMessages(true); }}
          hasMore={!noMoreData}
        >
          {
            messages.length > 0
            && messages.map((message) => (
              <div key={message._id}>
                <UserMessageListItem
                  image={message.profilePic}
                  userName={message.userName}
                  message={message.latestMessage}
                  count={message.unreadCount}
                  timeStamp={DateTime.fromISO(message.updatedAt).toFormat('MM/dd/yyyy t')}
                  handleDropdownOption={handleMessagesOption}
                  matchListId={message._id}
                />
              </div>

            ))
          }
        </InfiniteScroll>
      </div>
      {loadingChats && renderLoadingIndicator()}
      {noMoreData && renderNoMoreDataMessage()}
      <MessagesOptionDialog
        show={show}
        setShow={setShow}
        slectedMessageDropdownValue={messageOptionValue}
      />
    </AuthenticatedPageWrapper>
  );
}

export default Messages;
