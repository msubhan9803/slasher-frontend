import React from 'react';
import DatingPageWrapper from '../components/DatingPageWrapper';
import Chat from '../../../components/chat/Chat';

function DatingConversation() {
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

  return (
    <DatingPageWrapper>
      <h1 className="h3 mb-3">Messages</h1>
      <Chat messages={messages} conversationType="dating" />
    </DatingPageWrapper>
  );
}

export default DatingConversation;
