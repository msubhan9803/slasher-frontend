import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface Props {
  label: string;
  icon: IconDefinition;
  to: string;
  color?: string;
  className?: string;
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
  height: 4em;
  padding-left: 1.1em;

  .nav-item-label {
    font-size: .9em;
    line-height: 1.3em;
  }
`;
const LinkContentWrapper = styled.div`
  // This compensates for the icon offset
  padding-top: 0.2em;
`;

let instanceCounter = 0;

function SidebarNavItem({
  label, icon, color, to, className,
}: Props) {
  const uniqueId = `icon-${instanceCounter += 1}`;

  return (
    <StyledLink className={`mb-2 btn btn-sidebar d-flex align-items-center ${className}`} to={to}>
      <LinkContentWrapper className="d-flex align-items-center">
        <LinearIcon uniqueId={uniqueId}>
          <FontAwesomeIcon icon={icon} size="lg" className="me-2" />
        </LinearIcon>
        <div className="ms-2 text-start nav-item-label">
          {label}
        </div>
        <svg width="0" height="0">
          <linearGradient id={uniqueId} x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: `${color}`, stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: '1' }} />
          </linearGradient>
        </svg>
      </LinkContentWrapper>
    </StyledLink>
  );
}

SidebarNavItem.defaultProps = {
  className: '',
  color: '',
};

export default SidebarNavItem;
