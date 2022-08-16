import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import IconWithTextNavLink from '../../../../components/layout/main-site-wrapper/authenticated/IconWithTextNavLink';

const DatingMenuList = styled(Row)`
  left: 0;
  right:0;
`;
function DatingMenuSmallScreen() {
  return (
    <DatingMenuList className="bg-dark position-fixed d-lg-none mb-0 fixed-top">
      <Col xs={12}>
        <p className="text-center mt-1">Dating Menu</p>
      </Col>
      <Col className="my-2">
        <IconWithTextNavLink label="My Profile" icon={regular('user')} to="/" iconSize="lg" />
      </Col>
      <Col className="my-2">
        <IconWithTextNavLink label="Profiles" icon={regular('id-badge')} to="/" iconSize="lg" />
      </Col>
      <Col className="my-2">
        <IconWithTextNavLink label="Messages" icon={regular('comments')} to="/" iconSize="lg" />
      </Col>
      <Col className="my-2">
        <IconWithTextNavLink label="Likes" icon={regular('heart')} to="/" iconSize="lg" badgeIconClassName="text-primary" />
      </Col>
      <Col className="my-2">
        <IconWithTextNavLink label="Preferences" icon={solid('sliders')} to="/" iconSize="lg" />
      </Col>
    </DatingMenuList>
  );
}

export default DatingMenuSmallScreen;
