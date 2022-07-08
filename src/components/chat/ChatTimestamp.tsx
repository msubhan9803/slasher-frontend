import React from 'react';
import styled from 'styled-components';

const TimeStamp = styled.div`
  p {
    background-color: #1F1F1F;
  }
`;

function ChatTimestamp() {
  return (
    <TimeStamp className="d-flex align-items-center justify-content-center mb-4">
      <p
        className="mb-0 mx-3 px-4 py-1 rounded-5 small text-center"
      >
        Wednesday
      </p>
    </TimeStamp>
  );
}

export default ChatTimestamp;
