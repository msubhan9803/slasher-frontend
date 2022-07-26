import React, { useState } from 'react';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import UserMessageListItem from '../../components/ui/UserMessageList/UserMessageListItem';
import MessagesOptionDialog from './MessagesOptionDialog';

const messages = [
  {
    id: 1, image: 'https://i.pravatar.cc/300?img=19', userName: 'Eliza Williams', message: 'Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 2,
  },
  {
    id: 2, image: 'https://i.pravatar.cc/300?img=20', userName: 'Emma Grate', message: 'Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 9,
  },
  {
    id: 3, image: 'https://i.pravatar.cc/300?img=15', userName: 'Wiley Waites', message: 'Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 0,
  },
  {
    id: 4, image: 'https://i.pravatar.cc/300?img=12', userName: 'Stanley Knife', message: 'Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 0,
  },
  {
    id: 5, image: 'https://i.pravatar.cc/300?img=18', userName: 'Laura Norda', message: 'Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 0,
  },
  {
    id: 6, image: 'https://i.pravatar.cc/300?img=22', userName: 'Joe V. Awl', message: 'Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 0,
  },
  {
    id: 7, image: 'https://i.pravatar.cc/300?img=16', userName: 'Perry Scope', message: 'Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 0,
  },
];

function Messages() {
  const [show, setShow] = useState(false);
  const [messageOptionValue, setMessageOptionValue] = useState('');
  const handleMessagesOption = (messageOption: string) => {
    if (messageOption !== 'markAsRead') {
      setShow(true);
    }
    setMessageOptionValue(messageOption);
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <div>
        {messages.map((message) => (
          <UserMessageListItem
            key={message.id}
            image={message.image}
            userName={message.userName}
            message={message.message}
            count={message.count}
            timeStamp={message.timeStamp}
            handleDropdownOption={handleMessagesOption}
          />
        ))}
      </div>
      <MessagesOptionDialog
        show={show}
        setShow={setShow}
        slectedMessageDropdownValue={messageOptionValue}
      />
    </AuthenticatedPageWrapper>
  );
}

export default Messages;
