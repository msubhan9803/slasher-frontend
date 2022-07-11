import React from 'react';
import { Col, Row } from 'react-bootstrap';
import UserMessageList from '../../../ui/UserMessageList/UserMessageList';
import UserMessageListItem from '../../../ui/UserMessageList/UserMessageListItem';

function RecentMessage() {
  const recentMessageDetails = [
    { userName: 'Maureen Biologist', message: 'We ask only to be reassured', photo: 'https://i.pravatar.cc/300?img=47' },
    { userName: 'Teri Dactyl', message: 'There was a knock on the door and', photo: 'https://i.pravatar.cc/300?img=56' },
    { userName: 'Teri Dactyl', message: 'There was a knock on the door and', photo: 'https://i.pravatar.cc/300?img=26' },
  ];
  return (
    <>
      <Row className="align-items-center mt-4">
        <Col xs={9}>
          <h3 className="h4">Recent Messages</h3>
        </Col>
        <Col xs={3} className="text-end">
          <small className="text-primary">View All</small>
        </Col>
      </Row>
      {recentMessageDetails.map((recentMessageDetail) => (
        <UserMessageList className="mb-4">
          <UserMessageListItem
            userName={recentMessageDetail.userName}
            message={recentMessageDetail.message}
            count={6}
            image={recentMessageDetail.photo}
          />
        </UserMessageList>
      ))}

    </>
  );
}

export default RecentMessage;
