import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const ChatProfileStyleImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
`;

function ChatUserStatus() {
  return (
    <div className="align-items-center d-flex">
      <Link to="/messages/conversation/1" className="d-lg-none">
        <FontAwesomeIcon icon={solid('arrow-left')} size="2x" className="text-white border-end-0" />
      </Link>
      <ChatProfileStyleImage src="https://i.pravatar.cc/300?img=19" className="mx-3 ms-lg-0 rounded-circle bg-secondary" />
      <h1 className="h3 mb-0">Eliza Williams</h1>
    </div>
  );
}

export default ChatUserStatus;
