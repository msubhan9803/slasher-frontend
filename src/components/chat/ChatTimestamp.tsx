import React from 'react';
import styled from 'styled-components';

const TimeStamp = styled.div`
  small {
    background-color: #1F1F1F;
    color: #797979;
  }
`;

function ChatTimestamp() {
  return (
    <TimeStamp className="d-flex align-items-center justify-content-center mb-4">
      <small
        className="mb-0 mx-3 px-4 py-1 rounded-5 text-center"
      >
        Wednesday
      </small>
    </TimeStamp>
  );
}

export default ChatTimestamp;
