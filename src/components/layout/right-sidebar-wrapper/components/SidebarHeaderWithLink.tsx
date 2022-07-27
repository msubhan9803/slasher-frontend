import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  headerLabel: string;
  linkLabel: string;
  linkTo: string;
}

function SidebarHeaderWithLink({ headerLabel, linkLabel, linkTo }: Props) {
  return (
    <div className="d-flex align-items-end justify-content-between mt-4 mb-2">
      <h2 className="mb-0">{headerLabel}</h2>
      <Link to={linkTo}><small className="text-primary">{linkLabel}</small></Link>
    </div>
  );
}

export default SidebarHeaderWithLink;
