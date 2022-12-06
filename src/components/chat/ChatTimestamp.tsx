import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';

interface ChatTimeStampProps {
  messageTime?: string;
}

const TimeStamp = styled.div`
  span {
    background-color: #1F1F1F;
    color: #797979;
  }
`;

function ChatTimestamp({ messageTime }: ChatTimeStampProps) {
  const [timestampFormat, setTimestampFormat] = useState<string>();

  useEffect(() => {
    if (messageTime) {
      if (DateTime.now().diff(DateTime.fromISO(messageTime)).as('years') > 1) {
        setTimestampFormat(DateTime.fromISO(messageTime).toLocaleString({
          month: 'short',
          weekday: 'long',
          day: 'numeric',
          year: 'numeric',
        }));
      } else if (DateTime.now().diff(DateTime.fromISO(messageTime)).as('hours') > 48) {
        setTimestampFormat(DateTime.fromISO(messageTime).toLocaleString({ month: 'short', weekday: 'long', day: 'numeric' }));
      } else {
        setTimestampFormat(DateTime.fromISO(messageTime).toLocaleString({ weekday: 'long' }));
      }
    }
  }, [messageTime]);

  return (
    <TimeStamp className="p-3 fs-5 d-flex align-items-center justify-content-center">
      <span
        className="mb-0 mx-3 px-4 py-1 rounded-5 text-center"
      >
        {timestampFormat}
      </span>
    </TimeStamp>
  );
}

ChatTimestamp.defaultProps = {
  messageTime: null,
};

export default ChatTimestamp;
