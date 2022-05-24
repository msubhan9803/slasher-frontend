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
}

function AuthenticatedSiteTopNavLink({ label, icon, to }: Props) {
  return (
    <Nav.Link as={Link} to={to} className="text-center px-2">
      <FontAwesomeIcon icon={icon} size="lg" />
      <br />
      {label}
    </Nav.Link>
  );
}
export default AuthenticatedSiteTopNavLink;
