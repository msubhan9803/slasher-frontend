import React from 'react';
import { Link } from 'react-router-dom';
import { formatNumberWithUnits } from '../../../../utils/number.utils';

interface Props {
  headerLabel: string;
  linkLabel: string;
  linkTo: string;
  headerLabelCount?: number;
}

function SidebarHeaderWithLink({
  headerLabel, linkLabel, linkTo, headerLabelCount,
}: Props) {
  const hasLabelCount = typeof headerLabelCount !== 'undefined';
  return (
    <div className="d-flex align-items-end justify-content-between mt-4 mb-2">
      <div className="d-flex justify-content-start">
        <h2 className="mb-0">
          {headerLabel}
          { hasLabelCount && `: ${formatNumberWithUnits(headerLabelCount)}`}
        </h2>
      </div>
      <Link to={linkTo} className="text-decoration-none text-primary fs-5">{linkLabel}</Link>
    </div>
  );
}

SidebarHeaderWithLink.defaultProps = {
  headerLabelCount: 0,
};

export default SidebarHeaderWithLink;
