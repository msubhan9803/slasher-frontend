import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import TopNavLink from '../../../../components/layout/main-site-wrapper/authenticated/TopNavLink';
import CustomMessage from '../../../../components/ui/CustomMessage';
import SlasherProfile from '../../../../images/slasher-logo.svg';

const ViewAllText = styled.p`
font-size : .875rem
`;

const AdvertisementBox = styled.col`
height: 11.25rem;
width: 19.375rem;
background-color: #3A3B46;
`;

const RowLine = styled.div`
border: 0.063rem solid #171718;
`;

function DatingMenuLargeScreen() {
  return (
    <Col className="d-none d-md-block">
      <Row>
        <h1 className="fs-4 h4">Dating Menu</h1>
      </Row>
      <Row className="mt-3">
        <Col>
          <TopNavLink label="My Profile" icon={regular('user')} to="/" />
        </Col>
        <Col>
          <TopNavLink label="Profiles" icon={regular('id-badge')} to="/" badgeIconClassName="text-primary" />
        </Col>
        <Col>
          <TopNavLink label="Messages" icon={regular('comments')} to="/" badge={{ top: '-0.43rem', right: '1.75rem', count: 12 }} />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>
          <TopNavLink label="Likes" icon={regular('heart')} to="/" badge={{ top: '-0.31rem', right: '1.56rem', count: 6 }} />
        </Col>
        <Col>
          <TopNavLink label="Preferences" icon={solid('sliders')} to="/" />
        </Col>
        <Col />
      </Row>
      <Row className="mt-3">
        <Col md={9}>
          <h1 className="h4">Recent Messages</h1>
        </Col>
        <Col md={3} className="px-0">
          <ViewAllText className="text-primary text-end">View All</ViewAllText>
        </Col>
      </Row>
      <CustomMessage
        userName="Maureen Biologist"
        message="We ask only to be reassured"
        count={6}
        image={SlasherProfile}
      />
      <RowLine />
      <CustomMessage
        userName="Teri Dactyl"
        message="There was a knock on the door and "
        count={6}
        image={SlasherProfile}
      />
      <Row className="mt-3">
        <h1 className="h4">Advertisment</h1>
      </Row>
      <Row>
        <AdvertisementBox className="ms-3" />
      </Row>
    </Col>
  );
}

export default DatingMenuLargeScreen;
