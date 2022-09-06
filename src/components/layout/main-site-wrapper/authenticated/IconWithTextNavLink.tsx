import React from 'react';
import { IconDefinition, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { Link, useLocation } from 'react-router-dom';
import IconWithTextNavItemInnerElement from './IconWithTextNavItemInnerElement';

interface Props {
  label: string;
  icon: IconDefinition;
  iconSize: SizeProp;
  to: string;
  badge?: number;
  badgeIconClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

function IconWithTextNavLink({
  label, icon, iconSize, to, badge, badgeIconClassName, className, children,
}: Props) {
  const { pathname } = useLocation();
  return (
    <Link to={to} className={`text-decoration-none ${className}`}>
      <IconWithTextNavItemInnerElement
        label={label}
        icon={icon}
        iconSize={iconSize}
        badge={badge}
        badgeIconClassName={badgeIconClassName}
        active={pathname.startsWith(to)}
      />
      {children}
    </Link>
  );
}

IconWithTextNavLink.defaultProps = {
  badgeIconClassName: '',
  className: '',
  badge: null,
  children: null,
};

export default IconWithTextNavLink;
