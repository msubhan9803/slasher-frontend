import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';

function FriendRequest() {
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
  const friendRequestPhotos = [
    { id: 1, image: 'https://i.pravatar.cc/300?img=19', userName: 'Maureen Biologist' },
    { id: 2, image: 'https://i.pravatar.cc/300?img=20', userName: 'Bernadette Audrey' },
    { id: 3, image: 'https://i.pravatar.cc/300?img=09', userName: 'Stephanie Sue' },
  ];
  return (
    <>
      <Row className="align-items-center mt-4">
        <Col xs={9}>
          <h3 className="h4">Friend requests</h3>
        </Col>
        <Col xs={3} className="text-end">
          <small className="text-primary">View All</small>
        </Col>
      </Row>
      {friendRequestPhotos.map((request) => (
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

    </>
  );
}

export default FriendRequest;
