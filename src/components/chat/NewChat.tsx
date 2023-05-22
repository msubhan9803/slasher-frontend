import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import LoadingIndicator from '../ui/LoadingIndicator';
import { getConversation, markAllReadForSingleConversation } from '../../api/messages';
import { Message, User } from '../../types';
import { useAppSelector } from '../../redux/hooks';
import socketStore from '../../socketStore';
import { getConversationMessages } from '../../api/chat';
import { LG_MEDIA_BREAKPOINT, topToDivHeight } from '../../constants';
import ChatOptions from './ChatOptions';
import ChatUserStatus from './ChatUserStatus';
import ChatMessages from './ChatMessages';
import NewChatInput from './NewChatInput';

interface Props {
  viewerUserId: string;
  conversationId: string;
}

const StyledChatContainer = styled.div`

  // If the chat page shows a body scrollbar, you probably need to increase the value of
  // topToDivHeight.  The header height probably changed and topToDivHeight was not updated.

  max-height: calc(100vh - ${topToDivHeight + 60}px); // adding 60 to account for mobile browser address bar
  @media (min-width: ${LG_MEDIA_BREAKPOINT}) {
    max-height: calc(100vh - ${topToDivHeight}px);
  }

  .chat-body {
    overflow-y: auto;
  }
`;

enum LoadState {
  Loading,
  LoadSuccess,
  LoadFailure,
}

function NewChat({
  viewerUserId, conversationId,
}: Props) {
  const { socket } = socketStore;
  const isSocketConnected = useAppSelector((state) => state.socket.isConnected);
  const [loadState, setLoadState] = useState<LoadState>(LoadState.Loading);
  const [otherParticipant, setOtherParticipant] = useState<User>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [noEarlierMessagesAvailable, setNoEarlierMessagesAvailable] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>();

  const prependEarlierMessages = useCallback((earlierMessages: Message[]) => {
    if (earlierMessages.length === 0) {
      setNoEarlierMessagesAvailable(true);
      return;
    }

    earlierMessages.reverse();
    setMessages((prev: any) => [
      ...earlierMessages,
      ...prev,
    ]);
  }, []);

  const appendNewMessage = useCallback((message: any) => {
    setMessages((prev: any) => [
      ...prev,
      message,
    ]);
  }, []);

  const loadEarlierMessages = useCallback((
    beforeId: string | null,
    afterLoadCallback: () => void,
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    getConversationMessages(
      conversationId,
      15,
      beforeId || undefined,
      abortControllerRef.current?.signal,
    ).then((res) => {
      prependEarlierMessages(res.data);
      afterLoadCallback();
    });
  }, [conversationId, prependEarlierMessages]);

  const loadConversation = useCallback(async () => {
    try {
      const response = await getConversation(conversationId);
      setOtherParticipant(response.data.participants.find(
        (participant: any) => participant._id !== viewerUserId,
      ));
      // When a conversation is loaded, we mark all messages as read.  This is an async
      // operation, but nothing else depends on it and it can run in the background.
      markAllReadForSingleConversation(conversationId);
      // Load messages from that conversation
      loadEarlierMessages(null, () => {
        setLoadState(LoadState.LoadSuccess);
      });
    } catch (errResponse) {
      setLoadState(LoadState.LoadFailure);
    }
  }, [conversationId, viewerUserId, loadEarlierMessages]);

  const onChatMessageReceivedHandler = useCallback((responsePayload: any) => {
    // This message event is global and could be for ANY conversation
    // (not just the currently open one), so we need to check before
    // appending it to the current conversation's message list.
    const { message } = responsePayload;

    if (message.matchId === conversationId) {
      // Since this message is from the current conversation, indicate that it has been read.
      socket!.emit('messageRead', { messageId: responsePayload.message._id });
      appendNewMessage(message);
    }
  }, [appendNewMessage, conversationId, socket]);

  useEffect(() => {
    if (conversationId) {
      setLoadState(LoadState.Loading);
      loadConversation();
    } else {
      setLoadState(LoadState.LoadFailure);
    }
  }, [conversationId, loadConversation]);

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
    // Whenever there is a change to the messages (added, removed, etc.), adjust the scroll
    // position to maintain the same relative position.

  });

  if (loadState === LoadState.Loading || !isSocketConnected) {
    return <LoadingIndicator />;
  }

  if (loadState === LoadState.LoadFailure) {
    return <div>Unable to load conversation.</div>;
  }

  return (
    <StyledChatContainer className="d-flex flex-column h-100">
      <div className="chat-header">
        <div className="d-flex align-items-center">
          <div className="flex-fill">
            <ChatUserStatus userData={otherParticipant} />
          </div>
          <div>
            <ChatOptions userData={otherParticipant} />
          </div>
        </div>
      </div>
      <div className="chat-body flex-fill">
        <p>
          messages:
          {' '}
          {messages.length}
        </p>
        <p>
          <ChatMessages messages={messages} viewerUserId={viewerUserId} />
        </p>
      </div>
      <div className="chat-footer py-3">
        {/* <input type="text" className="form-control" placeholder="Type a message here..." /> */}
        <NewChatInput onSubmit={(message, files) => console.log('message: ', message, 'files: ', files)} />
      </div>
    </StyledChatContainer>
  );
}

export default NewChat;
