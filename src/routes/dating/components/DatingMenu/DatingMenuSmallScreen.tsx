import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import TopNavLink from '../../../../components/layout/main-site-wrapper/authenticated/TopNavLink';

const DatingMenuList = styled(Row)`
  bottom: 0;
  left: 0;
  right:0;
`;
function DatingMenuSmallScreen() {
  return (
    <DatingMenuList className="mt-3 m-1 bg-dark position-fixed d-md-none mb-0">
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
