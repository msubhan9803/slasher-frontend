import React from 'react';
import { IconDefinition, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

interface Props {
  label: string;
  icon: IconDefinition;
  iconSize: SizeProp;
  badge?: number;
  badgeIconClassName?: string
}

const BadgeSpan = styled.span`
  font-size: xx-small;
`;

function GlobalNavItemInnerElement({
  label, icon, iconSize, badge, badgeIconClassName,
}: Props) {
  return (
    <div className="d-flex flex-column justify-content-evenly text-center text-white position-relative ">
      <FontAwesomeIcon icon={icon} size={iconSize} className={badgeIconClassName} />
      {badge
        && (
          <BadgeSpan className="top-0 start-50 translate-middle-y badge rounded-pill bg-primary position-absolute">
            {badge}
          </BadgeSpan>
        )}
      <p className="mb-0 text-center px-1 mt-2">{label}</p>
    </div>
  );
}

GlobalNavItemInnerElement.defaultProps = {
  badgeIconClassName: '',
  badge: null,
};

export default GlobalNavItemInnerElement;
