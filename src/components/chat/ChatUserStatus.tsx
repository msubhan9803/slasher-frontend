import React from 'react';
import UserCircleImage from '../ui/UserCircleImage';

function ChatUserStatus() {
  return (
    <div className="ps-3 ps-lg-0 align-items-center d-flex">
      <UserCircleImage size="3.334rem" src="https://i.pravatar.cc/300?img=19" className="ms-0 me-3 bg-secondary" />
      <h1 className="h3 mb-0">Eliza Williams</h1>
    </div>
  );
}

export default ChatUserStatus;
