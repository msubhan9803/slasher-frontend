/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { AxiosError, CanceledError } from 'axios';
import { debounce } from 'lodash';
import InfiniteScroll from 'react-infinite-scroller';
import LoadingIndicator from '../ui/LoadingIndicator';
import { getConversation, markAllReadForSingleConversation, sendMessageWithFiles } from '../../api/messages';
import { Message, User } from '../../types';
import { useAppSelector } from '../../redux/hooks';
import socketStore from '../../socketStore';
import { getConversationMessages } from '../../api/chat';
import {
  bottomMobileNavHeight, topToDivHeight,
} from '../../constants';
import ChatOptions from './ChatOptions';
import ChatUserStatus from './ChatUserStatus';
import ChatMessages from './ChatMessages';
import NewChatInput from './NewChatInput';

interface Props {
  viewerUserId: string;
  conversationId: string;
}

const maxChatImageHeight = 200;

const StyledChatContainer = styled.div`
  // Always set height to 100vh.  We will restrict max-height separately
  // with js to work around other issues on mobile.
  height: 100vh;

  .chat-body {
    overflow-y: auto;
  }
`;

enum LoadState {
  Loading,
  LoadSuccess,
  LoadFailure,
}

const preloadImagesFromMessageResponse = async (messagesToPreload: Message[]) => {
  const imagePromises = messagesToPreload.map((message) => {
    if (message.image) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = reject;
        image.src = message.image;
      });
    }
    return Promise.resolve();
  });
  await Promise.all(imagePromises);
};

function NewChat({
  viewerUserId, conversationId,
}: Props) {
  const { socket } = socketStore;
  const isSocketConnected = useAppSelector((state) => state.socket.isConnected);
  const [loadState, setLoadState] = useState<LoadState>(LoadState.Loading);
  const [otherParticipant, setOtherParticipant] = useState<User>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [maxHeight, setMaxHeight] = useState<number>(0);
  const [noEarlierMessagesAvailable, setNoEarlierMessagesAvailable] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBodyElementRef = useRef<HTMLDivElement>(null);

  const updateMaxHeightBasedOnCurrentWindowHeight = debounce(() => {
    let newHeight = window.innerHeight;
    if (window.innerWidth >= 960) {
      newHeight -= topToDivHeight;
    } else {
      // add addition spacing beyond bottomMobileNavHeight so we don't cut it too close with padding
      newHeight -= bottomMobileNavHeight + 15;
    }
    setMaxHeight(newHeight);
  }, 100);

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

  const scrollChatToBottom = useCallback(() => {
    const chatBodyElement = chatBodyElementRef.current;
    if (!chatBodyElement) { return; }
    const scrollFunction = () => { chatBodyElement.scrollTop = chatBodyElement.scrollHeight; };
    // Scroll immediately so that users don't see a visual jump.
    scrollFunction();
    // And also scroll again after 1ms slight delay to account for first-time-load delay.
    setTimeout(() => {
      scrollFunction();
    }, 1);
  }, []);

  const scrollChatToBottomIfCloseToBottomAlready = useCallback(() => {
    const chatBodyElement = chatBodyElementRef.current;
    if (!chatBodyElement) { return; }
    // If user is < threshold pixels from the bottom, trigger scroll to bottom
    const threshold = maxChatImageHeight + 10;
    const scrollDistanceFromBottom = chatBodyElement.scrollHeight
      - (chatBodyElement.scrollTop + chatBodyElement.clientHeight);
    if (scrollDistanceFromBottom < threshold) {
      scrollChatToBottom();
    }
  }, [scrollChatToBottom]);

  const loadEarlierMessages = useCallback(async (
    beforeId: string | null,
    preloadImages?: boolean,
    afterLoadCallback?: () => void,
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await getConversationMessages(
        conversationId,
        15,
        beforeId || undefined,
        abortControllerRef.current?.signal,
      );

      if (res.data.length > 0) {
        // NOTE: The line below is disabled for now, but if enabled it will wait until all images
        // are loaded before they are inserted into the chat.  This will eliminate any jumpiness
        // as images load gradually, but will also make the overall load time seem longer for
        // users.
        if (preloadImages) { await preloadImagesFromMessageResponse(res.data); }
        prependEarlierMessages(res.data);
      } else {
        setNoEarlierMessagesAvailable(true);
      }
      afterLoadCallback?.();
    } finally {
      abortControllerRef.current = null;
    }
  }, [conversationId, prependEarlierMessages]);

  const infiniteScrollLoadMore = useCallback(() => {
    if (abortControllerRef.current) {
      return; // return because load is already in progress
    }
    loadEarlierMessages(messages[0]._id);
  }, [loadEarlierMessages, messages]);

  const loadConversation = useCallback(async () => {
    try {
      const response = await getConversation(conversationId);
      const nonViewerParticipant = response.data.participants.find(
        (participant: any) => participant._id !== viewerUserId,
      );
      setOtherParticipant(nonViewerParticipant);
      // When a conversation is loaded, we mark all messages as read.  This is an async
      // operation, but nothing else depends on it and it can run in the background.
      markAllReadForSingleConversation(conversationId);
      // Load messages from that conversation
      await loadEarlierMessages(null, true, () => {
        setLoadState(LoadState.LoadSuccess);
      });
    } catch (errResponse) {
      if (!(errResponse instanceof CanceledError)) {
        // NOTE: We ignore CanceledError because that only occurs in the development environment
        // when StrictMode is enabled.  But all other error types indicate load failure.
        setLoadState(LoadState.LoadFailure);
      }
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
    updateMaxHeightBasedOnCurrentWindowHeight();
    window.addEventListener('resize', updateMaxHeightBasedOnCurrentWindowHeight);
    return () => { window.removeEventListener('resize', updateMaxHeightBasedOnCurrentWindowHeight); };
  }, [updateMaxHeightBasedOnCurrentWindowHeight]);

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

  // Always scroll to bottom on initial load
  useEffect(() => {
    if (loadState === LoadState.LoadSuccess) { scrollChatToBottom(); }
  }, [loadState, scrollChatToBottom]);

  // Whenever messages change, scroll to bottom if user is alreay close to the bottom
  useEffect(() => {
    scrollChatToBottomIfCloseToBottomAlready();
  }, [messages, scrollChatToBottomIfCloseToBottomAlready]);

  const handleChatSubmit = useCallback(
    async (messageText: string, files: File[], fileDescriptions: string[]) => {
      console.log('message: ', messageText, 'files: ', files, 'fileDescriptions: ', fileDescriptions);
      if (files.length > 0) {
        // Handle message with files
        try {
          const response = await sendMessageWithFiles(
            messageText,
            files,
            conversationId,
            fileDescriptions,
          );
          setMessages((prev: any) => [
            ...prev,
            ...response.data.messages,
          ]);
          return await Promise.resolve();
        } catch (err: any) {
          if (err instanceof AxiosError) {
            throw new Error(`Unexpected error while sending message with attachment: ${err.response!.data.message}`);
          } else {
            throw new Error(err);
          }
        }
      }
      // Send single message
      return new Promise<void>((resolve, reject) => {
        socket?.emit('chatMessage', { message: messageText, toUserId: otherParticipant!._id }, (chatMessageResponse: any) => {
          if (chatMessageResponse.success) {
            const newMessage: Message = chatMessageResponse.message;
            setMessages((prev: any) => [
              ...prev,
              newMessage,
            ]);
            resolve();
          } else {
            reject(new Error(chatMessageResponse.errorMessage));
          }
        });
      });
    },
    [conversationId, otherParticipant, socket],
  );

  if (loadState === LoadState.Loading || !isSocketConnected) {
    return <LoadingIndicator />;
  }

  if (loadState === LoadState.LoadFailure) {
    return <div>Unable to load conversation.</div>;
  }

  return (
    <StyledChatContainer className="d-flex flex-column h-100" style={{ maxHeight: `${maxHeight}px` }}>
      <div className="chat-header">
        <div className="py-2">
          <div className="d-flex align-items-center">
            <div className="flex-fill">
              <ChatUserStatus userData={otherParticipant} />
            </div>
            <div>
              <ChatOptions userData={otherParticipant} />
            </div>
          </div>
        </div>
      </div>
      <div ref={chatBodyElementRef} className="chat-body flex-fill">
        <InfiniteScroll
          isReverse
          threshold={250}
          initialLoad={false}
          loader={<div><LoadingIndicator /></div>}
          loadMore={infiniteScrollLoadMore}
          hasMore={!noEarlierMessagesAvailable}
          /* Using a custom parentNode element to base the scroll calulations on. */
          useWindow={false}
          getScrollParent={() => chatBodyElementRef.current}
        >
          <ChatMessages
            maxChatImageHeight={maxChatImageHeight}
            messages={messages}
            viewerUserId={viewerUserId}
            onImageLoad={scrollChatToBottomIfCloseToBottomAlready}
          />
        </InfiniteScroll>
      </div>
      <div className="chat-footer">
        <div className="py-3">
          <NewChatInput
            placeholder="Type your message here..."
            onSubmit={handleChatSubmit}
            onFocus={updateMaxHeightBasedOnCurrentWindowHeight}
            onBlur={updateMaxHeightBasedOnCurrentWindowHeight}
          />
        </div>
      </div>
    </StyledChatContainer>
  );
}

export default NewChat;
