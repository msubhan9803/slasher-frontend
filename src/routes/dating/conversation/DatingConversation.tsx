import React from 'react';
import DatingPageWrapper from '../components/DatingPageWrapper';
// import Chat from '../../../components/chat/Chat';

function DatingConversation() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messages = [
    {
      id: '1',
      message: 'Hi, Aly',
      participant: 'other',
      time: '01:35 PM',
    },
    {
      id: '2',
      message: 'How are you.',
      participant: 'other',
      time: '01:35 PM',
    },
    {
      id: '3',
      message: "I'm fine, how are you.",
      participant: 'self',
      time: '01:35 PM',
    },
    {
      id: '4',
      message: 'There is no one who loves pain itself',
      participant: 'self',
      time: '01:35 PM',
    },
    {
      id: '5',
      message: 'Where can I get some?',
      participant: 'self',
      time: '01:35 PM',
    },
    {
      id: '6',
      message: 'How are you.',
      participant: 'other',
      time: '01:35 PM',
    },
  ];

  return (
    <DatingPageWrapper>
      <div className="mt-5 pt-5 mt-lg-0 pt-lg-0">
        {/* <Chat messages={messages} /> */}
      </div>
    </DatingPageWrapper>
  );
}

export default DatingConversation;
