import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Col, Row } from 'react-bootstrap';
import UserMessageList from '../../components/ui/UserMessageList/UserMessageList';
import UserMessageListItem from '../../components/ui/UserMessageList/UserMessageListItem';
import UserCircleImage from '../../components/ui/UserCircleImage';

const AdvertisementBox = styled.div`
  height: 11.25rem;
  background-color: #3A3B46;
`;

const friendRequest = [
  { id: 1, image: 'https://i.pravatar.cc/300?img=19', userName: 'Eliza Williams' },
  { id: 2, image: 'https://i.pravatar.cc/300?img=13', userName: 'Joe V. Awls' },
  { id: 3, image: 'https://i.pravatar.cc/300?img=15', userName: 'Perry Scope' },
];
const AcceptRequestStyled = styled(FontAwesomeIcon)`
  padding: 0.25rem 0.313rem;
`;

const RejectRequestStyled = styled(FontAwesomeIcon)`
  padding: 0.25rem 0.438rem;
`;
function ConversationRightSideNav() {
  return (
    <>
      <h2 className="h4 mb-3">Advertisement</h2>
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
      {
        friendRequest.map((request) => (
          <div key={request.id} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-dark mt-3">
            <div className="d-flex align-items-center">
              <UserCircleImage size="2.5rem" src={request.image} className="me-2 bg-secondary position-relative" />
              <p className="mb-0">{request.userName}</p>
            </div>
            <div className="align-self-center d-flex">
              <AcceptRequestStyled icon={solid('check')} className="bg-success rounded-5 me-2" />
              <RejectRequestStyled icon={solid('times')} className="bg-primary rounded-5" />
            </div>
          </div>
        ))
      }
    </>
  );
}

export default ConversationRightSideNav;
