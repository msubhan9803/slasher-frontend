import React from 'react';
import { IconDefinition, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import UserCircleImage from '../../../ui/UserCircleImage';

interface Props {
  label: string;
  userProfileIcon?: string,
  userProfileIconSize?: string,
  icon?: IconDefinition;
  iconSize?: SizeProp;
  badge?: number;
  badgeIconClassName?: string;
  active?: boolean;
}

const BadgeSpan = styled.span`
  font-size: xx-small;
  padding-top: 5px;
`;

const StyledMenuIcon = styled(FontAwesomeIcon)`
  height: 20.99px;
`;
function IconWithTextNavItemInnerElement({
  label, userProfileIcon, userProfileIconSize, icon, iconSize, badge, badgeIconClassName, active,
}: Props) {
  return (
    <div className="d-flex flex-column justify-content-between text-center position-relative text-decoration-none fs-5">
      {/* <div className="d-flex flex-column position-relative fs-5"> */}
      {
        userProfileIcon
          ? <UserCircleImage size={userProfileIconSize} src={userProfileIcon} className="mx-auto" />
          : <StyledMenuIcon icon={icon!} size={iconSize!} className={`${active ? 'text-primary' : 'text-white'} ${badgeIconClassName}`} />
      }
      {!!badge
        && (
          <BadgeSpan className="top-0 start-50 translate-middle-y badge rounded-pill bg-primary position-absolute">
            {badge}
          </BadgeSpan>
        )}
      <p className={`mb-0 text-center mt-1 ${active ? 'text-primary' : 'text-white'} text-truncate`}>{label}</p>
    </div>
  );
}

IconWithTextNavItemInnerElement.defaultProps = {
  badgeIconClassName: '',
  badge: null,
  active: false,
  userProfileIcon: null,
  userProfileIconSize: null,
  icon: null,
  iconSize: null,
};

export default IconWithTextNavItemInnerElement;
