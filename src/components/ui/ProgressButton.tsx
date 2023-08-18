import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement, useEffect, useState } from 'react';
import { ButtonProps, Spinner } from 'react-bootstrap';
import RoundButton from './RoundButton';

type ProgressButtonStatus = 'default' | 'loading' | 'failure';

// eslint-disable-next-line max-len
export type ProgressButtonComponentType = ({ label, className, onClick }: Props) => ReactElement<any>;

type Props = {
  label: string,
  className: string,
  onClick: Function,
  id?: string,
  type?: ButtonProps['type'],
  variant?: string,
};

type SetProgressFunction = (status: ProgressButtonStatus) => void;

const useProgressButton = (): [ProgressButtonComponentType, SetProgressFunction] => {
  const [progress, setProgress] = useState<ProgressButtonStatus>('default');

  useEffect(() => {
    if (progress !== 'failure') { return undefined; }

    const restoreDefaultStatusTimeout = setTimeout(() => {
      setProgress('default');
    }, 1_500);
    return () => clearTimeout(restoreDefaultStatusTimeout);
  }, [progress, setProgress]);

  const ProgessButtonComponent = React.useMemo(() => {
    function ProgessButton({
      label, className = '', onClick = () => { }, id, type, variant,
    }: Props) {
      const disabled = progress !== 'default';
      return (
        <RoundButton
          id={id}
          disabled={disabled}
          type={type}
          className={className}
          onClick={onClick}
          variant={variant}
        >
          {progress === 'default' && label}
          {progress === 'loading' && <Spinner size="sm" animation="border" role="status" />}
          {progress === 'failure' && <FontAwesomeIcon icon={solid('x')} size="1x" style={{ paddingTop: 3 }} />}
        </RoundButton>
      );
    }
    ProgessButton.defaultProps = {
      id: undefined,
      type: 'submit',
      variant: undefined,
    };
    return ProgessButton;
  }, [progress]);
  return [ProgessButtonComponent, setProgress];
};

export default useProgressButton;
