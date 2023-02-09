import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement, useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import RoundButton from './RoundButton';

type ProgressButtonStatus = 'default' | 'loading' | 'success' | 'failure';

type ProgressButtonComponentType = ({ label, className, onClick }: Props) => ReactElement<any>;

type Props = {
  label: string,
  className: string,
  onClick: Function,
};

type SetProgressFunction = (status: ProgressButtonStatus) => void;

const useProgressButton = (): [ProgressButtonComponentType, SetProgressFunction] => {
  const [progress, setProgress] = useState<ProgressButtonStatus>('default');

  useEffect(() => {
    const restoreDefaultStatusTimeout = setTimeout(() => {
      setProgress('default');
    }, 1_500);
    return () => clearTimeout(restoreDefaultStatusTimeout);
  }, [progress, setProgress]);

  const ProgessButtonComponent = React.useMemo(() => {
    function ProgessButton({
      label, className = '', onClick = () => { },
    }: Props) {
      const disabled = progress !== 'default';
      return (
        <RoundButton disabled={disabled} type="submit" className={className} onClick={onClick}>
          {progress === 'default' && label}
          {progress === 'loading' && <Spinner size="sm" animation="border" role="status" />}
          {progress === 'success' && <FontAwesomeIcon icon={solid('check')} size="1x" style={{ paddingTop: 3 }} />}
          {progress === 'failure' && <FontAwesomeIcon icon={solid('x')} size="1x" style={{ paddingTop: 3 }} />}
        </RoundButton>
      );
    }
    return ProgessButton;
  }, [progress]);
  return [ProgessButtonComponent, setProgress];
};

export default useProgressButton;
