import React from 'react';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';

const ChatProfileStyleImage = styled(Image)`
  height: 3.334rem;
  width: 3.334rem;
`;

function ChatUserStatus() {
  return (
    <div className="align-items-center d-flex">
      <ChatProfileStyleImage src="https://i.pravatar.cc/300?img=19" className="ms-0 me-3 rounded-circle bg-secondary" />
      <h1 className="h3 mb-0">Eliza Williams</h1>
    </div>
  );
}

export default ChatUserStatus;
