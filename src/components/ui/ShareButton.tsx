import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import BorderButton from './BorderButton';

function ShareButton() {
  return (
    <BorderButton
      buttonClass="d-flex d-xxl-none share-btn"
      variant="lg"
      icon={solid('share-nodes')}
      iconClass="me-2"
      iconSize="sm"
      lable="Share"
    />
  );
}

export default ShareButton;
