import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface Props {
  label: string;
  icon: IconDefinition;
  color?: string;
  id?: number;
  to: string;
}

interface Icon {
  uniqueId?: number
}

const LinearIcon = styled.div<Icon>`
  svg * {
    fill: url(#icon-${(props) => props.uniqueId});
  }
`;

function SidebarNavItem({
  label, icon, color, id, to,
}: Props) {
  return (
    <>
      <Link className="mb-2 btn btn-sidebar p-3" to={to}>
        <div className="d-flex">
          <LinearIcon uniqueId={id}>
            <FontAwesomeIcon icon={icon} size="lg" className="me-2" />
          </LinearIcon>
          <div className="ms-2 fs-6 text-start">
            {label}
          </div>
        </div>
      </Link>
      <svg width="0" height="0">
        <linearGradient id={`icon-${id}`} x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" style={{ stopColor: `${color}`, stopOpacity: '1' }} />
          <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: '1' }} />
        </linearGradient>
      </svg>
    </>
  );
}
SidebarNavItem.defaultProps = {
  color: '',
  id: 0,
};
export default SidebarNavItem;
