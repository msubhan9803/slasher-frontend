import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import RoundButton from './RoundButton';

export const useCustomProgressButtonStatus = () => useState<ProgressButtonState>('default');

export type ProgressButtonState = 'default' | 'loading' | 'success' | 'failure';

type Props = {
  status: ProgressButtonState, label: string, className?: string,
  onClick: Function, setStatus: Function
};

function CustomProgessButton({
  status, label, className = '', onClick = () => {}, setStatus = () => {},
}: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('default');
    }, 3_000);
    return () => clearTimeout(timer);
  }, [status, setStatus]);
  return (
    <RoundButton type="submit" className={className} onClick={onClick}>
      { status === 'default' && label}
      { status === 'loading' && <Spinner size="sm" animation="border" role="status" />}
      { status === 'success' && <FontAwesomeIcon icon={solid('check')} size="1x" style={{ paddingTop: 3 }} />}
      { status === 'failure' && <FontAwesomeIcon icon={solid('x')} size="1x" style={{ paddingTop: 3 }} />}
    </RoundButton>
  );
}

CustomProgessButton.defaultProps = {
  className: '',
};

export default CustomProgessButton;
