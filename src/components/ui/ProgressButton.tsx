import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement, useEffect, useState } from 'react';
import { ButtonProps, Spinner } from 'react-bootstrap';
import RoundButton from './RoundButton';

type ProgressButtonStatus = 'default' | 'loading' | 'success' | 'failure';

// eslint-disable-next-line max-len
export type ProgressButtonComponentType = ({ label, className, onClick }: Props) => ReactElement<any>;

type Props = {
  label: string,
  className: string,
  onClick: Function,
  id?: string,
  type?: ButtonProps['type'],
};

type SetProgressFunction = (status: ProgressButtonStatus) => void;

const useProgressButton = (): [ProgressButtonComponentType, SetProgressFunction] => {
  const [progress, setProgress] = useState<ProgressButtonStatus>('default');

  useEffect(() => {
    if (progress === 'loading' || progress === 'default') { return () => { }; }

    const restoreDefaultStatusTimeout = setTimeout(() => {
      setProgress('default');
    }, 1_500);
    return () => clearTimeout(restoreDefaultStatusTimeout);
  }, [progress, setProgress]);

  const ProgessButtonComponent = React.useMemo(() => {
    function ProgessButton({
      label, className = '', onClick = () => { }, id, type,
    }: Props) {
      const disabled = progress === 'loading';
      return (
        <RoundButton
          id={id}
          disabled={disabled}
          type={type}
          className={className}
          onClick={onClick}
        >
          {progress === 'default' && label}
          {progress === 'loading' && <Spinner size="sm" animation="border" role="status" />}
          {progress === 'success' && <FontAwesomeIcon icon={solid('check')} size="1x" style={{ paddingTop: 3 }} />}
          {progress === 'failure' && <FontAwesomeIcon icon={solid('x')} size="1x" style={{ paddingTop: 3 }} />}
        </RoundButton>
      );
    }
    ProgessButton.defaultProps = {
      id: undefined,
      type: 'submit',
    };
    return ProgessButton;
  }, [progress]);
  return [ProgessButtonComponent, setProgress];
};

export default useProgressButton;
