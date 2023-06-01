import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

type Props = { className?: string, style?: React.CSSProperties };
function LoadingIndicator({ className, style }: Props) {
  return (
    <div className={`text-center ${className}`} style={style}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

LoadingIndicator.defaultProps = {
  className: '',
  style: {},
};

export default LoadingIndicator;
