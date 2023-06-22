/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState, UIEvent,
} from 'react';
import styled from 'styled-components';
import { AxiosError, CanceledError } from 'axios';
import { debounce } from 'lodash';
import InfiniteScroll from 'react-infinite-scroller';
import LoadingIndicator from '../ui/LoadingIndicator';
import { getConversation, markAllReadForSingleConversation, sendMessageWithFiles } from '../../api/messages';
import { Message, User } from '../../types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import socketStore from '../../socketStore';
import { getConversationMessages } from '../../api/chat';
import {
  bottomMobileNavHeight, topToDivHeight,
} from '../../constants';
import ChatOptions from './ChatOptions';
import ChatUserStatus from './ChatUserStatus';
import ChatMessages from './ChatMessages';
import NewChatInput from './ChatInput';
import { removeRecentMessage } from '../../redux/slices/userSlice';

interface Props {
  viewerUserId: string;
  conversationId: string;
}

const maxChatImageHeight = 400;

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
  const imageUrlsToPreload: string[] = [];
  messagesToPreload.forEach((message) => {
    // TODO: When old API is retired, we can switch to using `image` instead of `urls`.
    // NOTE: The `urls` field should only ever have a maximum of 1 url, but we'll iterate
    // over it as an array just in case because that's the safest way to go.
    message.urls.forEach((url) => {
      imageUrlsToPreload.push(url);
    });
  });
  const imagePromises = imageUrlsToPreload.map((url) => new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve;
    // NOTE: We also call resolve() for onerror because this is just a preload attempt.
    // If we called reject instead, that would throw an error and could block other operations.
    image.onerror = resolve;
    image.src = url;
  }));
  await Promise.all(imagePromises);
};

function Chat({
  viewerUserId, conversationId,
}: Props) {
  const { socket } = socketStore;
  const isSocketConnected = useAppSelector((state) => state.socket.isConnected);
  const [loadState, setLoadState] = useState<LoadState>(LoadState.Loading);
  const [otherParticipant, setOtherParticipant] = useState<User>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [maxHeight, setMaxHeight] = useState<number>(0);
  const [noEarlierMessagesAvailable, setNoEarlierMessagesAvailable] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBodyElementRef = useRef<HTMLDivElement>(null);
  const latestChatScrollDistanceFromBottom = useRef<number>(0);
  const dispatch = useAppDispatch();

  const updateMaxHeightBasedOnCurrentWindowHeight = debounce(() => {
    let newHeight = window.innerHeight;
    if (window.innerWidth >= 960) {
      newHeight -= topToDivHeight;
    } else {
      // add addition spacing beyond bottomMobileNavHeight so we don't cut it too close with padding
      newHeight -= (bottomMobileNavHeight + 15);
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
    // And also scroll again after 1ms slight delay to account for
    // first-time-load delay (which minimizes visual jump).
    setTimeout(() => { scrollFunction(); }, 1);
    // And scroll one final time after a 100ms delay to account for
    // delays in rendering (which minimizes visual jump).
    setTimeout(() => { scrollFunction(); }, 100);
  }, []);

  const adjustScrollAfterMessageListChange = useCallback(() => {
    const chatBodyElement = chatBodyElementRef.current;
    if (!chatBodyElement) { return; }
    // If user is < threshold pixels from the bottom, trigger scroll to bottom
    const threshold = 100;
    const scrollDistanceFromBottom = chatBodyElement.scrollHeight
      - chatBodyElement.scrollTop - chatBodyElement.clientHeight;

    if (scrollDistanceFromBottom < threshold) {
      scrollChatToBottom();
    } else {
      // Attempt to retain previous scroll position to make upward scroll smoother
      const diff = latestChatScrollDistanceFromBottom.current - scrollDistanceFromBottom;
      chatBodyElement.scrollTop -= diff;
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
    if (messages.length === 0) {
      // Load messages from that conversation
      // Preload images on the first load in order to guarantee that we have a predictable height
      // for the first chunk of content, so everything is loaded when we scroll to the bottom.
      loadEarlierMessages(null, true);
    } else {
      loadEarlierMessages(messages[0]._id, false); // not currently preloading images here
    }
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
      setLoadState(LoadState.LoadSuccess);
    } catch (errResponse) {
      if (!(errResponse instanceof CanceledError)) {
        // NOTE: We ignore CanceledError because that only occurs in the development environment
        // when StrictMode is enabled.  But all other error types indicate load failure.
        setLoadState(LoadState.LoadFailure);
      }
    }
  }, [conversationId, viewerUserId]);

  const onChatMessageReceivedHandler = useCallback((responsePayload: any) => {
    // This message event is global and could be for ANY conversation
    // (not just the currently open one), so we need to check before
    // appending it to the current conversation's message list.
    const { message } = responsePayload;

    if (message.matchId === conversationId) {
      // Since this message is from the current conversation, indicate that it has been read.
      socket!.emit('messageRead', { messageId: responsePayload.message._id });
      appendNewMessage(message);
      dispatch(removeRecentMessage(message.matchId));
    }
  }, [appendNewMessage, conversationId, socket, dispatch]);

  // For adjusting chat container height based on window size changes (to get around css 100vh issue
  // with mobile browser navbar.
  useEffect(() => {
    updateMaxHeightBasedOnCurrentWindowHeight();
    window.addEventListener('resize', updateMaxHeightBasedOnCurrentWindowHeight);
    return () => { window.removeEventListener('resize', updateMaxHeightBasedOnCurrentWindowHeight); };
  }, [updateMaxHeightBasedOnCurrentWindowHeight]);

  useEffect(() => {
    if (conversationId) {
      setLoadState(LoadState.Loading);
      loadConversation();
      dispatch(removeRecentMessage(conversationId));
    } else {
      setLoadState(LoadState.LoadFailure);
    }
  }, [conversationId, loadConversation, dispatch]);

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
    adjustScrollAfterMessageListChange();
  }, [messages, adjustScrollAfterMessageListChange]);

  const handleChatSubmit = useCallback(
    async (messageText: string, files: File[], fileDescriptions: string[]) => {
      setErrors([]);

      if (files.length === 0) {
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
      }

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
      } catch (err: any) {
        if (err instanceof AxiosError) {
          setErrors(err.response!.data.message);
          return Promise.reject();
        }
        throw new Error(err);
      }
      return Promise.resolve();
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
    <StyledChatContainer className="d-flex flex-column" style={{ height: `${maxHeight}px` }}>
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
      <div
        ref={chatBodyElementRef}
        className="chat-body flex-fill"
        onScroll={(e: UIEvent<HTMLDivElement>) => {
          const chatBodyElement = e.target as HTMLDivElement;
          const scrollDistanceFromBottom = chatBodyElement.scrollHeight
            - (chatBodyElement.scrollTop + chatBodyElement.clientHeight);
          latestChatScrollDistanceFromBottom.current = scrollDistanceFromBottom;
        }}
      >
        <InfiniteScroll
          isReverse
          threshold={500}
          initialLoad
          loader={(
            <div>
              {!noEarlierMessagesAvailable && <div key="loader"><LoadingIndicator /></div>}
            </div>
          )}
          loadMore={infiniteScrollLoadMore}
          hasMore={!noEarlierMessagesAvailable}
          /* Using a custom parentNode element to base the scroll calulations on. */
          useWindow={false}
          getScrollParent={() => chatBodyElementRef.current}
        >
          <ChatMessages
            key="chat-messages"
            maxChatImageHeight={maxChatImageHeight}
            messages={messages}
            viewerUserId={viewerUserId}
            onImageLoad={adjustScrollAfterMessageListChange}
          />
        </InfiniteScroll>
      </div>
      <div className="chat-footer">
        <div className="py-3">
          <NewChatInput
            placeholder="Type your message here..."
            errorsToDisplay={errors}
            onSubmit={handleChatSubmit}
            onFocus={updateMaxHeightBasedOnCurrentWindowHeight}
            onBlur={updateMaxHeightBasedOnCurrentWindowHeight}
            onRemoveFile={() => setErrors([])}
          />
        </div>
      </div>
    </StyledChatContainer>
  );
}

export default Chat;
