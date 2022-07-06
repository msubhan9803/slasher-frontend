import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import Switch from '../../../components/ui/Switch';
import UserMessageList from '../../../components/ui/UserMessageList/UserMessageList';
import UserMessageListItem from '../../../components/ui/UserMessageList/UserMessageListItem';

const FriendRequestImage = styled(Image)`
  height: 2.5rem;
  width: 2.5rem;
`;
const AcceptRequestStyled = styled(FontAwesomeIcon)`
  padding: 0.25rem 0.313rem;
`;
const RejectRequestStyled = styled(FontAwesomeIcon)`
  padding: 0.25rem 0.438rem;
`;
const AdvertisementBox = styled.div`
  height: 15.625rem;
`;
const friendRequest = [
  { id: 1, image: 'https://i.pravatar.cc/300?img=19', userName: 'Maureen Biologist' },
  { id: 2, image: 'https://i.pravatar.cc/300?img=20', userName: 'Bernadette Audrey' },
  { id: 3, image: 'https://i.pravatar.cc/300?img=09', userName: 'Stephanie Sue' },
];

function NewsPartnerRightSideNav() {
  return (
    <>

      <Row className="mt-2 d-none d-md-flex">
        <h1 className="h4 my-3 ps-0">Advertisement</h1>
        <AdvertisementBox className=" bg-dark " />
      </Row>
      <Col className="d-none d-md-block">
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
            image="https://i.pravatar.cc/300?img=47"
          />
          <UserMessageListItem
            userName="Teri Dactyl"
            message="There was a knock on the door and"
            count={6}
            image="https://i.pravatar.cc/300?img=56"
          />
          <UserMessageListItem
            userName="Teri Dactyl"
            message="There was a knock on the door and"
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
    </>
  );
}
export default NewsPartnerRightSideNav;
