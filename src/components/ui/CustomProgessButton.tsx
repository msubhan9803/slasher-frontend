import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import RoundButton from './RoundButton';

export type ProgressButtonState = 'default' | 'loading' | 'success' | 'failure';

type Props = {
  label: string, className: string,
  onClick: Function,
};

type SetProgressType = (status: ProgressButtonState) => void;

const useCustomProgressButtonStatus = (): [any, SetProgressType] => {
  const [progress, setProgress] = useState<ProgressButtonState>('default');

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress('default');
    }, 3_000);
    return () => clearTimeout(timer);
  }, [progress, setProgress]);

  const Button = React.useMemo(() => {
    function CustomProgessButton({
      label, className = '', onClick = () => {},
    }: Props) {
      return (
        <RoundButton type="submit" className={className} onClick={onClick}>
          { progress === 'default' && label}
          { progress === 'loading' && <Spinner size="sm" animation="border" role="status" />}
          { progress === 'success' && <FontAwesomeIcon icon={solid('check')} size="1x" style={{ paddingTop: 3 }} />}
          { progress === 'failure' && <FontAwesomeIcon icon={solid('x')} size="1x" style={{ paddingTop: 3 }} />}
        </RoundButton>
      );
    }
    return CustomProgessButton;
  }, [progress]);
  return [Button, setProgress];
};

export default useCustomProgressButtonStatus;
