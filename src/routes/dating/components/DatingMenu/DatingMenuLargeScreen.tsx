import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import TopNavLink from '../../../../components/layout/main-site-wrapper/authenticated/TopNavLink';
import UserMessageList from '../../../../components/ui/UserMessageList/UserMessageList';
import UserMessageListItem from '../../../../components/ui/UserMessageList/UserMessageListItem';
import slasherLogo from '../../../../placeholder-images/placeholder-user.jpg';

const AdvertisementBox = styled.div`
  height: 11.25rem;
  width: 19.375rem;
  background-color: #3A3B46;
`;

function DatingMenuLargeScreen() {
  return (
    <>
      <h1 className="h4 mb-4">Dating Menu</h1>
      <Row className="mt-3 mb-3">
        <Col md={4}>
          <TopNavLink label="My Profile" icon={regular('user')} to="/" />
        </Col>
        <Col md={4}>
          <TopNavLink label="Profiles" icon={regular('id-badge')} to="/" badgeIconClassName="text-primary" />
        </Col>
        <Col md={4}>
          <TopNavLink label="Messages" icon={regular('comments')} to="/" badge={12} />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={4}>
          <TopNavLink label="Likes" icon={regular('heart')} to="/" badge={6} />
        </Col>
        <Col md={4}>
          <TopNavLink label="Preferences" icon={solid('sliders')} to="/" />
        </Col>
        <Col />
      </Row>

      <Row className="align-items-center">
        <Col xs={9}>
          <h1 className="h4">Recent Messages</h1>
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
          image={slasherLogo}
        />
        <UserMessageListItem
          userName="Teri Dactyl"
          message="There was a knock on the door and "
          count={6}
          image={slasherLogo}
        />
      </UserMessageList>

      <h1 className="h4 mb-3">Advertisment</h1>
      <AdvertisementBox />
    </>
  );
}

export default DatingMenuLargeScreen;
