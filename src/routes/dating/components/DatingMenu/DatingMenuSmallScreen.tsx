import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import TopNavLink from '../../../../components/layout/main-site-wrapper/authenticated/TopNavLink';

const DatingMenuList = styled(Row)`
  left: 0;
  right:0;
  z-index : 9999;
`;
function DatingMenuSmallScreen() {
  return (
    <DatingMenuList className="bg-dark position-fixed d-md-none mb-0 fixed-top">
      <Col xs={12}>
        <p className="text-center mt-1">Dating Menu</p>
      </Col>
      <Col className="my-2">
        <TopNavLink label="My Profile" icon={regular('user')} to="/" />
      </Col>
      <Col className="my-2">
        <TopNavLink label="Profiles" icon={regular('id-badge')} to="/" badgeIconClassName="text-primary" />
      </Col>
      <Col className="my-2">
        <TopNavLink label="Messages" icon={regular('comments')} to="/" />
      </Col>
      <Col className="my-2">
        <TopNavLink label="Likes" icon={regular('heart')} to="/" />
      </Col>
      <Col className="my-2">
        <TopNavLink label="Preferences" icon={solid('sliders')} to="/" />
      </Col>
    </DatingMenuList>
  );
}

export default DatingMenuSmallScreen;
