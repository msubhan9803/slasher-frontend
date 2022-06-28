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

let instanceCounter = 0;

function SidebarNavItem({
  label, icon, color, to, className,
}: Props) {
  const uniqueId = `icon-${instanceCounter += 1}`;

  return (
    <Link className={`mb-2 btn btn-sidebar p-3 ${className}`} to={to}>
      <div className="d-flex">
        <LinearIcon uniqueId={uniqueId}>
          <FontAwesomeIcon icon={icon} size="lg" className="me-2" />
        </LinearIcon>
        <div className="ms-2 fs-6 text-start">
          {label}
        </div>
        <svg width="0" height="0">
          <linearGradient id={uniqueId} x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: `${color}`, stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: '1' }} />
          </linearGradient>
        </svg>
      </div>
    </Link>
  );
}

SidebarNavItem.defaultProps = {
  className: '',
  color: '',
};

export default SidebarNavItem;
