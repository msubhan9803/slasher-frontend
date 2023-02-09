import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import IconWithTextNavLink from '../../../../components/layout/main-site-wrapper/authenticated/IconWithTextNavLink';
import RecentMessages from '../../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import FriendRequests from '../../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import AdvertisementBox from '../../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';

function DatingSidebar() {
  return (
    <>
      <h2 className="mb-4">Dating Menu</h2>
      <Row className="my-4">
        <Col md={4}>
          <IconWithTextNavLink label="My Profile" icon={regular('user')} iconSize="2x" to="/app/dating/profile" />
        </Col>
        <Col md={4}>
          <IconWithTextNavLink label="Profiles" icon={regular('id-badge')} iconSize="2x" to="/app/dating/deck" />
        </Col>
        <Col md={4}>
          <IconWithTextNavLink label="Messages" icon={regular('comments')} iconSize="2x" to="/app/dating/messages" badge={12} />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={4}>
          <IconWithTextNavLink label="Likes" icon={regular('heart')} iconSize="2x" to="/app/dating/likes" badge={6} />
        </Col>
        <Col md={4}>
          <IconWithTextNavLink label="Preferences" icon={solid('sliders')} iconSize="2x" to="/app/dating/setup/additional-preferences" />
        </Col>
        <Col />
      </Row>
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default DatingSidebar;
