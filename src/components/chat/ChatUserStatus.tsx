import React from 'react';
import { Link } from 'react-router-dom';
import UserCircleImage from '../ui/UserCircleImage';
import { ChatUserProps } from './ChatProps';

function ChatUserStatus({ userData }: ChatUserProps) {
  return (
    <Link to={`/${userData?.userName}`} className="text-decoration-none">
      <div className="ps-3 ps-lg-0 align-items-center d-flex">
        <UserCircleImage size="3.334rem" src={userData?.profilePic} className="ms-0 me-3 bg-secondary" />
        <h1 className="h3 mb-0">{userData?.userName}</h1>
      </div>
    </Link>
  );
}

ChatUserStatus.defaulProps = {
  userData: {},
};

export default ChatUserStatus;
