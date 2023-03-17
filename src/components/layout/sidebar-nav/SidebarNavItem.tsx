import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Link, matchPath, useLocation } from 'react-router-dom';

interface Props {
  label: string;
  icon: IconDefinition;
  to: string;
  iconColor?: string;
  className?: string;
  id: number;
  onToggleCanvas?: () => void;
}

interface LinearIconProps {
  uniqueId?: string
}

const LinearIcon = styled.div<LinearIconProps>`
 svg * {
  fill: url(#${(props) => props.uniqueId});
}
`;

const StyledLink = styled(Link)`
  height: 3.35em;
  padding: 0 0 0 1.1em;
  margin-bottom: 0.75rem;

  .nav-item-label {
    line-height: 1.3em;
  }
`;
const LinkContentWrapper = styled.div`
  padding-top: 0.2em;
`;

const StyledIcon = styled(FontAwesomeIcon)`
  font-size:1.25rem;
`;

function SidebarNavItem({
  label, icon, iconColor: color, to, className, id, onToggleCanvas,
}: Props) {
  const { pathname } = useLocation();
  return (
    <StyledLink
      className={`w-100 btn rounded-3 btn-dark d-flex align-items-center ${className}
      ${matchPath({ path: to, end: false }, pathname) ? 'btn-filter' : ''}`}
      to={to}
      onClick={onToggleCanvas}
    >
      <LinkContentWrapper className="d-flex align-items-center justify-content-between">
        <LinearIcon uniqueId={`icon-${id}`}>
          <StyledIcon icon={icon} size="lg" className="me-1 fa-fw" />
        </LinearIcon>
        <div className="ms-2 text-start nav-item-label fs-5">
          {label}
        </div>
        <svg width="0" height="0">
          <linearGradient id={`icon-${id}`} x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: `${color}`, stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: 'var(--bs-link-color)', stopOpacity: '1' }} />
          </linearGradient>
        </svg>
      </LinkContentWrapper>
    </StyledLink>
  );
}

SidebarNavItem.defaultProps = {
  className: '',
  iconColor: '',
  onToggleCanvas: () => { },
};

export default SidebarNavItem;
