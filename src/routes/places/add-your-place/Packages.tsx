import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

interface PackageProps {
  btnborder: string;
}

const StyledPackages = styled(Button) <PackageProps>`
  &.package-1 {
    border: ${(data) => (data.btnborder === 'month' ? '1px solid #FF1800' : '1px solid #3A3B46')};
    width: 7.534rem;
    height: 7.934rem;
  }
  &.package-2 {
    border: ${(data) => (data.btnborder === 'fullMonth' ? '1px solid #FF1800' : '1px solid #3A3B46')};
    width: 7.534rem;
    height: 9.267rem;
    .best-deal {
      top: -0.6rem;
      left: 0.8rem;
      width: 5.934rem;
      .h6 {
        line-height: 1.334rem !important;
      }
    }
    .full-month {
      margin-top: -0.8rem;
    }
  }
  .month {
    line-height: 0.4;
  }
  .check {
    bottom: -0.9rem;
    left: 2.89rem;
    width: 1.6rem;
    height: 1.6rem;
    border: 1px solid #3A3B46
  }
`;
function Packages() {
  const [month, setMonth] = useState(false);
  const [fullMonth, setFullMonth] = useState(true);
  return (
    <div className="d-flex">
      <StyledPackages btnborder={(month && 'month').toString()} className="rounded-3 text-white position-relative package-1 me-4 bg-transparent" onClick={() => { setMonth(true); setFullMonth(false); }}>
        <span className="m-0 fs-1">1</span>
        <p className="month fs-5 text-light">month</p>
        <p className="m-0 fs-3 text-light">
          <span className="text-primary">
            $20&nbsp;
          </span>
          /mo
        </p>
        {month && (
          <div className="check d-flex justify-content-center align-items-center rounded-circle position-absolute bg-black">
            <FontAwesomeIcon icon={solid('check')} size="sm" className="text-success" />
          </div>
        )}
      </StyledPackages>
      <StyledPackages btnborder={(fullMonth && 'fullMonth').toString()} className="rounded-3 text-white position-relative package-2 rounded bg-transparent" onClick={() => { setFullMonth(true); setMonth(false); }}>
        <div className="best-deal rounded-pill position-absolute bg-primary">
          <h1 className="h6 m-0 text-black">BEST DEAL</h1>
        </div>
        <div className="full-month">
          <span className="m-0 fs-1">12</span>
          <p className="month fs-5 text-light">month</p>
          <p className="mb-1 fs-3 text-primary">$200</p>
          <p className="m-0 fs-5 text-light month">2 months free</p>
        </div>
        {fullMonth && (
          <div className="check d-flex justify-content-center align-items-center rounded-circle position-absolute bg-black">
            <FontAwesomeIcon icon={solid('check')} size="sm" className="text-success" />
          </div>
        )}
      </StyledPackages>
    </div>
  );
}

export default Packages;
