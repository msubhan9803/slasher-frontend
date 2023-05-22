import { DateTime } from 'luxon';
import React from 'react';
import styled from 'styled-components';
import { enableDevFeatures } from '../../utils/configEnvironment';
import ChatMessageText from './ChatMessageText';
import ChatTimestamp from './ChatTimestamp';
import { Message } from '../../types';

interface Props {
  messages: Message[];
  viewerUserId: string;
}

interface MessageProps {
  message: Message;
  createdByViewer: boolean;
}

const StyledChatMessage = styled.div`
  &.self-message {
    align-self: flex-end !important;
    .message-bubble {
      border-radius: 1.25rem;
      border-bottom-right-radius: 0rem;
      background: linear-gradient(90deg, #5C258D 2%, #4389A2 100%), var(--bs-secondary);
    }
  }

  &.other-message {
    align-self: flex-start !important;
    .message-bubble {
        background-color: #1F1F1F;
        border-radius: 1.25rem;
        border-bottom-left-radius: 0rem;
    }
  }
`;

function UserChatMessage({ message, createdByViewer }: MessageProps) {
  return (
    <StyledChatMessage className={`mb-3 ${createdByViewer ? 'self-message' : 'other-message'}`}>
      <div className="message-bubble p-3"><ChatMessageText message={message.message} /></div>
    </StyledChatMessage>
  );
}

function ChatMessages({
  messages, viewerUserId,
}: Props) {
  const renderMessage = (message: Message, previousMessage?: Message) => {
    if (message.fromId === viewerUserId) { <div>{message.message}</div>; }
    let insertTimestamp = false;

    if (previousMessage) {
      const messageDateString = DateTime.fromISO(message.createdAt).toISODate();
      const previousMessageDateString = DateTime.fromISO(previousMessage.createdAt).toISODate();
      insertTimestamp = messageDateString !== previousMessageDateString;
    }

    return (
      <>
        {insertTimestamp && <ChatTimestamp messageTime={message.createdAt} />}
        <UserChatMessage message={message} createdByViewer={message.fromId === viewerUserId} />
      </>
    );
  };

  // const renderMessage = (message: any) => (
  //   <React.Fragment key={message.id}>
  //     {(!lastTimeStampMessage || DateTime.fromISO(lastTimeStampMessage).toISODate()
  //       !== DateTime.fromISO(message.time).toISODate())
  //       && <ChatTimestamp messageTime={message.time} />}
  //     {message.participant === 'other' ? (
  //       <div className="other-message mb-3">
  //         <div className="mb-2">
  //           {message.image
  //             ? (
  //               <Image
  //                 src={message.image}
  //                 alt={`${message.imageDescription ? message.imageDescription : 'User upload'}`}
  //                 className="w-50 h-auto img-fluid rounded-3"
  //                 onLoad={() => onImageLoad()}
  //               />
  //             )
  //             : (
  //               <p className="fs-4 mb-0 p-3 text-white">
  //                 <ChatMessageText message={message.message} />
  //               </p>
  //             )}
  //         </div>
  //         <span className="fs-6 time-stamp align-items-center d-flex">
  //           {DateTime.fromISO(message.time).toFormat('h:mm a')}
  //           {
  //             enableDevFeatures && (
  //               <>
  //                 {' '}
  //                 &bull;
  //                 {' '}
  //                 Report message
  //               </>
  //             )
  //           }
  //         </span>
  //       </div>
  //     ) : (
  //       <div className="self-message align-items-end d-flex flex-column mb-3">
  //         <div className={`mb-2 d-flex justify-content-end ${message.image ? 'w-100'
  //            : 'w-auto'}`}
  //            style={{ maxWidth: '100%' }}>
  //           {message.image
  //             ? (
  //               <Image
  //                 src={message.image}
  //                 alt={`${message.imageDescription ? message.imageDescription : 'User upload'}`}
  //                 className="w-50 h-auto img-fluid rounded-3"
  //                 onLoad={() => onImageLoad()}
  //               />
  //             )
  //             : (
  //               <p className="fs-4 mb-0 p-3 text-white" style={{ maxWidth: '100%' }}>
  //                 <ChatMessageText message={message.message} />
  //               </p>
  //             )}
  //         </div>
  //         <span
  //          className="time-stamp fs-6">{DateTime.fromISO(message.time).toFormat('h:mm a')}</span>
  //       </div>
  //     )}
  //   </React.Fragment>
  // );

  return (
    <div className="d-flex flex-column ps-0 pe-3">
      {
        messages?.map(
          (message, index) => renderMessage(message, index > 0 ? messages[index - 1] : undefined),
        )
      }
    </div>
  );
}

export default ChatMessages;
