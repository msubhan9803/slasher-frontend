import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

const CircleStyledButton = styled(Button)`
  padding: 0;
  width: 2rem;
  height: 2rem;
`;

interface Props {
  variant: string;
  icon: IconDefinition;
  className?: string;
}

function CircleButton({ variant, icon, className }: Props) {
  return (
    <CircleStyledButton variant={variant} className={`d-flex flex-row align-items-center justify-content-center rounded-5 ${className}`}>
      <FontAwesomeIcon icon={icon} />
    </CircleStyledButton>
  );
}

CircleButton.defaultProps = {
  className: '',
};

export default CircleButton;
