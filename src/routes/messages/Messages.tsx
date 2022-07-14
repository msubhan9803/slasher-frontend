import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row, Container } from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import UserMessageList from '../../components/ui/UserMessageList/UserMessageList';
import UserMessageListItem from '../../components/ui/UserMessageList/UserMessageListItem';
import MessagesOptionDialog from './MessagesOptionDialog';

const messages = [
  {
    id: 1, image: 'https://i.pravatar.cc/300?img=19', userName: 'Eliza Williams', message: 'Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 2,
  },
  {
    id: 2, image: 'https://i.pravatar.cc/300?img=20', userName: 'Emma Grate', message: 'Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 0,
  },
  {
    id: 3, image: 'https://i.pravatar.cc/300?img=15', userName: 'Wiley Waites', message: 'Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 0,
  },
  {
    id: 4, image: 'https://i.pravatar.cc/300?img=12', userName: 'Stanley Knife', message: 'Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 0,
  },
  {
    id: 5, image: 'https://i.pravatar.cc/300?img=18', userName: 'Laura Norda', message: 'Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 9,
  },
  {
    id: 6, image: 'https://i.pravatar.cc/300?img=22', userName: 'Joe V. Awl', message: 'Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 0,
  },
  {
    id: 7, image: 'https://i.pravatar.cc/300?img=16', userName: 'Perry Scope', message: 'Lorem Ipsum is simply dummy text of the printing and...', timeStamp: '06/18/2022 11:10PM', count: 0,
  },
];
const friendRequest = [
  { id: 1, image: 'https://i.pravatar.cc/300?img=19', userName: 'Eliza Williams' },
  { id: 2, image: 'https://i.pravatar.cc/300?img=13', userName: 'Joe V. Awls' },
  { id: 3, image: 'https://i.pravatar.cc/300?img=15', userName: 'Perry Scope' },
];
const AdvertisementBox = styled.div`
  height: 11.25rem;
  background-color: #3A3B46;
`;

const FriendRequestImage = styled.img`
  height: 2.5rem;
  width: 2.5rem;
`;

const AcceptRequestStyled = styled(FontAwesomeIcon)`
  padding: 0.25rem 0.313rem;
`;

const RejectRequestStyled = styled(FontAwesomeIcon)`
  padding: 0.25rem 0.438rem;
`;

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
      <Container fluid>
        <Row>
          <Col md={8}>
            <h1 className="h3 mb-3">Messages</h1>
            <div className="bg-dark px-3 py-2 rounded-3">
              {messages.map((message) => (
                <UserMessageListItem
                  key={message.id}
                  image={message.image}
                  userName={message.userName}
                  message={message.message}
                  count={message.count}
                  timeStamp={message.timeStamp}
                  options
                  handleDropdownOption={handleMessagesOption}
                />
              ))}
            </div>

          </Col>
          <Col md={4} className="d-none d-md-block">
            <h2 className="h4 mb-3">Advertisment</h2>
            <AdvertisementBox className="w-100" />
            <Row className="align-items-center mt-4">
              <Col xs={9}>
                <h3 className="h4">Recent Messages</h3>
              </Col>
              <Col xs={3} className="text-end">
                <small className="text-primary">View All</small>
              </Col>
            </Row>
            <UserMessageList className="mb-4">
              <UserMessageListItem
                userName="Maureen Biologist"
                message="We ask only to be reassured"
                count={6}
                image="https://i.pravatar.cc/300?img=22"
              />
              <UserMessageListItem
                userName="Teri Dactyl"
                message="There was a knock on the door and "
                count={6}
                image="https://i.pravatar.cc/300?img=26"
              />
              <UserMessageListItem
                userName="Teri Dactyl"
                message="There was a knock on the door and "
                count={6}
                image="https://i.pravatar.cc/300?img=26"
              />
            </UserMessageList>
            <Row className="align-items-center mt-4">
              <Col xs={9}>
                <h3 className="h4">Friend requests</h3>
              </Col>
              <Col xs={3} className="text-end">
                <small className="text-primary">View All</small>
              </Col>
            </Row>
            {friendRequest.map((request) => (
              <div key={request.id} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-dark mt-3">
                <div className="d-flex align-items-center">
                  <FriendRequestImage src={request.image} className="me-2 rounded-circle bg-secondary position-relative" />
                  <p className="mb-0">{request.userName}</p>
                </div>
                <div className="align-self-center d-flex">
                  <AcceptRequestStyled icon={solid('check')} className="bg-success rounded-5 me-2" />
                  <RejectRequestStyled icon={solid('times')} className="bg-primary rounded-5" />
                </div>
              </div>
            ))}
          </Col>
        </Row>
        <MessagesOptionDialog
          show={show}
          setShow={setShow}
          slectedMessageDropdownValue={messageOptionValue}
        />
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default Messages;
