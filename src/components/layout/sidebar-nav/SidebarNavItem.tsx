import React from 'react';
import {
  Button,
  Form,
} from 'react-bootstrap';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

interface Props {
  label: string;
  icon: IconDefinition;
  color?: string;
  id?: number
}

const SideMenuStyle = styled.div`
  background-color: rgb(31, 31, 31);
`;

interface Icon {
  uniqueId?: number
}
const LinearIcon = styled.div<Icon>`
  svg * {
    fill: url(#icon-${(props) => props.uniqueId});
  }
`;
function SidebarNavItem({
  label, icon, color, id,
}: Props) {
  return (
    <>
      <Form className="me-auto w-100">
        <SideMenuStyle className="d-flex p-3 my-1 w-100 rounded-3">
          <LinearIcon uniqueId={id}>
            <FontAwesomeIcon icon={icon} size="lg" className="me-2" />
          </LinearIcon>
          <div className="ms-2">
            <Button
              variant="form"
              size="lg"
              className="w-50 border-0 text-start p-0 fs-6"
              name="menu-button"
            >
              {label}
            </Button>
          </div>
        </SideMenuStyle>

      </Form>
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
