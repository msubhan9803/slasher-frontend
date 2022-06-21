import React from 'react';
import { Nav } from 'react-bootstrap';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Badge {
  top: string;
  right: string;
  count?: number;
}
interface Props {
  label: string;
  icon: IconDefinition;
  to: string;
  linkClassNames?: string;
  badge?: Badge;
  badgeIconClassName?: string
}
const UserProfileText = styled.p`
  font-size: .75rem;
`;
const BadgeSpan = styled.span`
  font-size: xx-small;
`;

function TopNavLink({
  label, icon, to, linkClassNames, badge, badgeIconClassName,
}: Props) {
  return (
    <Nav.Link as={Link} to={to} className={`text-center text-white position-relative ${linkClassNames}`}>
      <FontAwesomeIcon icon={icon} size="lg" className={badgeIconClassName} />
      {badge
        && (
          <BadgeSpan
            className="badge badge-primary rounded-circle bg-primary position-absolute d-block"
            style={{
              top: badge.top, right: badge.right,
            }}
          >
            {badge.count}
          </BadgeSpan>
        )}
      <br />
      <UserProfileText className="mb-0">{label}</UserProfileText>
    </Nav.Link>
  );
}

TopNavLink.defaultProps = {
  linkClassNames: '',
  badgeIconClassName: '',
  badge: null,
};

export default TopNavLink;
