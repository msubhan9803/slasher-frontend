import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Col, Container, Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import userProfileIconPlaceholder from '../../../placeholder-images/placeholder-user.jpg';

const UserCircleImage = styled.img`
  width:1.56rem;
`;

interface Props {
  className?: string
}

function MobileOnlySidebarContent({ className }: Props) {
  return (
    <div className={className}>
      <Container fluid className="px-0">
        <Row>
          <Col xs={4}>
            <Link to="/" className="btn btn-sidebar w-100 pt-2">
              <UserCircleImage className="rounded-circle mb-1" src={userProfileIconPlaceholder} alt="User icon" />
              <br />
              Profile
            </Link>
          </Col>
          <Col xs={4}>
            <Link to="/" className="btn btn-sidebar w-100 pt-2">
              <FontAwesomeIcon icon={solid('user-group')} size="lg" className="mb-1" />
              <br />
              Friends
            </Link>
          </Col>
          <Col xs={4}>
            <Link to="/" className="btn btn-sidebar w-100 pt-2">
              <FontAwesomeIcon icon={solid('circle-question')} size="lg" className="mb-1" />
              <br />
              Help
            </Link>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

MobileOnlySidebarContent.defaultProps = {
  className: '',
};

export default MobileOnlySidebarContent;
