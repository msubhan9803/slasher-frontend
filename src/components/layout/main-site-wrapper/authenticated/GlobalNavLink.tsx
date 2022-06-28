import React from 'react';
import { IconDefinition, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { Link } from 'react-router-dom';
import GlobalNavItemInnerElement from './GlobalNavItemInnerElement';

interface Props {
  label: string;
  icon: IconDefinition;
  iconSize: SizeProp;
  to: string;
  badge?: number;
  badgeIconClassName?: string
  className?: string
}

function GlobalNavLink({
  label, icon, iconSize, to, badge, badgeIconClassName, className,
}: Props) {
  return (
    <Link to={to} className={className}>
      <GlobalNavItemInnerElement
        label={label}
        icon={icon}
        iconSize={iconSize}
        badge={badge}
        badgeIconClassName={badgeIconClassName}
      />
    </Link>
  );
}

GlobalNavLink.defaultProps = {
  badgeIconClassName: '',
  className: '',
  badge: null,
};

export default GlobalNavLink;
