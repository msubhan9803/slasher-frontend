import React from 'react';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';

const ChatProfileStyleImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
`;

function ChatUserStatus() {
  return (
    <div className="align-items-center d-flex">
      <ChatProfileStyleImage src="https://i.pravatar.cc/300?img=19" className="mx-3 ms-lg-0 rounded-circle bg-secondary" />
      <h1 className="h3 mb-0">Eliza Williams</h1>
    </div>
  );
}

export default ChatUserStatus;
