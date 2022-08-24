import React from 'react';
import Chat from '../../components/chat/Chat';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';

const messages = [
  {
    id: 1,
    message: 'Hi, Aly',
    participant: 'other',
    time: '01:35 PM',
  },
  {
    id: 2,
    message: 'How are you.',
    participant: 'other',
    time: '01:35 PM',
  },
  {
    id: 3,
    message: "I'm fine, how are you.",
    participant: 'self',
    time: '01:35 PM',
  },
  {
    id: 4,
    message: 'There is no one who loves pain itself',
    participant: 'self',
    time: '01:35 PM',
  },
  {
    id: 5,
    message: 'Where can I get some?',
    participant: 'self',
    time: '01:35 PM',
  },
  {
    id: 6,
    message: 'How are you.',
    participant: 'other',
    time: '01:35 PM',
  },
];

function Conversation() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <Chat messages={messages} />
    </AuthenticatedPageWrapper>
  );
}

export default Conversation;
