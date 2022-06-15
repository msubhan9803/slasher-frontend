import React from 'react';
import {
  Nav,
} from 'react-bootstrap';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

interface Props {
  label: string;
  icon: IconDefinition;
  to: string;
  classNames?: string;
}

function TopNavLink({
  label, icon, to, classNames,
}: Props) {
  return (
    <Nav.Link as={Link} to={to} className={`text-center text-white ${classNames}`}>
      <FontAwesomeIcon icon={icon} size="lg" />
      <br />
      <p style={{ fontSize: '12px' }}>{label}</p>

    </Nav.Link>
  );
}

TopNavLink.defaultProps = {
  classNames: '',
};

export default TopNavLink;
