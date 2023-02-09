import React from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

const StyledWorth = styled.div`
  color: #00FF0A;
  div {
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid #3A3B46;
    background: #1F1F1F;
  }
  FontAwesomeIcon {
    width: 1.326rem;
    height: 1.391rem;
  }
`;
function WorthContent() {
  return (
    <StyledWorth className="me-3 align-items-center d-flex justify-content-end justify-content-xl-start">
      <div className="rounded-circle p-3 me-2 d-flex align-items-center justify-content-center">
        <FontAwesomeIcon icon={regular('thumbs-up')} size="lg" />
      </div>
      <p className="fs-2 fw-bold m-0">Worth it!</p>
    </StyledWorth>
  );
}

export default WorthContent;
