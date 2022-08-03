import React from 'react';
import styled from 'styled-components';

const TimeStamp = styled.div`
  span {
    background-color: #1F1F1F;
    color: #797979;
  }
`;

function ChatTimestamp() {
  return (
    <TimeStamp className="fs-5 d-flex align-items-center justify-content-center mb-4">
      <span
        className="mb-0 mx-3 px-4 py-1 rounded-5 text-center"
      >
        Wednesday
      </span>
    </TimeStamp>
  );
}

export default ChatTimestamp;
