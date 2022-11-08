import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Col, Container, Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import userProfileIconPlaceholder from '../../../placeholder-images/placeholder-user.jpg';
import UserCircleImage from '../../ui/UserCircleImage';

const SpecificHeightLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
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
            <SpecificHeightLink to="/" className="btn btn-dark btn-sidebar w-100 pt-2">
              <UserCircleImage size="1.25em" className="mb-1" src={userProfileIconPlaceholder} alt="User icon" />
              Me
            </SpecificHeightLink>
          </Col>
          <Col xs={4}>
            <SpecificHeightLink to="/" className="btn btn-dark btn-sidebar w-100 pt-2">
              <FontAwesomeIcon icon={solid('user-group')} size="lg" className="mb-1" />
              Friends
            </SpecificHeightLink>
          </Col>
          <Col xs={4}>
            <SpecificHeightLink to="/" className="btn btn-dark btn-sidebar w-100 pt-2">
              <FontAwesomeIcon icon={solid('circle-question')} size="lg" className="mb-1" />
              Help
            </SpecificHeightLink>
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
