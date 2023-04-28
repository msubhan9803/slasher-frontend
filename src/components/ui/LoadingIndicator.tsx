import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

type Props = { className?: string };
function LoadingIndicator({ className }: Props) {
  return (
    <div className={`text-center ${className}`}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

LoadingIndicator.defaultProps = {
  className: '',
};

export default LoadingIndicator;
