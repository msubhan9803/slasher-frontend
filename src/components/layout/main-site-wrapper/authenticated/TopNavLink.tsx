import React from 'react';
import {
  Nav,
} from 'react-bootstrap';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Badge {
  top: string;
  right: string;
}
interface Props {
  label: string;
  icon: IconDefinition;
  to: string;
  classNames?: string;
  badge?: Badge;
}
const UserProfileText = styled.p`
  font-size: .75rem;
`;
const BadgeSpan = styled.span`
  display: block;
  font-size: xx-small;
`;
function TopNavLink({
  label, icon, to, classNames, badge,
}: Props) {
  return (
    <Nav.Link as={Link} to={to} className={`text-center text-white position-relative ${classNames}`}>
      <FontAwesomeIcon icon={icon} size="lg" />
      {badge
        && (
          <BadgeSpan
            className="badge badge-primary rounded-circle bg-primary position-absolute"
            style={{
              top: badge.top, right: badge.right,
            }}
          >
            2
          </BadgeSpan>
        )}
      <br />
      <UserProfileText className="mb-0">{label}</UserProfileText>
    </Nav.Link>
  );
}

TopNavLink.defaultProps = {
  classNames: '',
  badge: '',
};

export default TopNavLink;
