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
      <h1 className="fs-4 h4">Dating Menu</h1>

      <Row className="mt-3 mb-3">
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

      <Row className="mb-4">
        <Col>
          <TopNavLink label="Likes" icon={regular('heart')} to="/" badge={{ top: '-0.31rem', right: '1.56rem', count: 6 }} />
        </Col>
        <Col>
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
