import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface Props {
  label: string;
  icon: IconDefinition;
  to: string;
  badge?: number;
  badgeIconClassName?: string
}
const UserProfileText = styled.p`
  font-size: .75rem;
`;
const BadgeSpan = styled.span`
  font-size: xx-small;
`;

const Links = styled(Link)`
  width : 90px
`;

function TopNavLink({
  label, icon, to, badge, badgeIconClassName,
}: Props) {
  return (
    <Links to={to}>
      <div className="d-flex flex-column justify-content-evenly text-center text-white position-relative ">
        <FontAwesomeIcon icon={icon} size="lg" className={badgeIconClassName} />
        {badge
          && (
            <BadgeSpan className="top-0 start-50 translate-middle-y badge rounded-pill bg-primary position-absolute">
              {badge}
            </BadgeSpan>
          )}
        <UserProfileText className="mb-0 text-center px-2 mt-2">{label}</UserProfileText>
      </div>
    </Links>
  );
}

TopNavLink.defaultProps = {
  badgeIconClassName: '',
  badge: null,
};

export default TopNavLink;
