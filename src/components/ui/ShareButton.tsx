import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import RoundButton from './RoundButton';

const StyleBorderButton = styled(RoundButton)`
  border: 1px solid #3A3B46;
  &:hover {
    border: 1px solid #3A3B46;
  }
`;
function ShareButton() {
  return (
    <StyleBorderButton className="d-flex align-items-center share-btn bg-black py-2" variant="lg">
      <FontAwesomeIcon icon={solid('share-nodes')} size="sm" className="me-2" />
      <p className="fs-3 fw-bold m-0">Share</p>
    </StyleBorderButton>
  );
}

export default ShareButton;
