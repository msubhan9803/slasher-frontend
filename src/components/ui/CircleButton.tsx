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
  onAcceptRejectClick: (val: string) => void;
  userId: string;
  label?: string;
  style?: any;
}

function CircleButton({
  variant, icon, className, onAcceptRejectClick, userId, label,
  style,
}: Props) {
  return (
    <CircleStyledButton
      onClick={() => onAcceptRejectClick(userId)}
      variant={variant}
      className={`d-flex flex-row align-items-center justify-content-center rounded-5 ${className}`}
      aria-label={label}
      style={style}
    >
      <FontAwesomeIcon icon={icon} />
    </CircleStyledButton>
  );
}

CircleButton.defaultProps = {
  className: '',
  label: '',
  style: undefined,
};

export default CircleButton;
