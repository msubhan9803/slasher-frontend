import React from 'react';
import { Alert } from 'react-bootstrap';

interface MessageProps {
  errorMessages: string[];
  className?: string;
}
function ErrorMessageList({ errorMessages, className }: MessageProps) {
  return (
    <Alert className={className}>
      {typeof errorMessages === 'string'
        ? errorMessages
        : (
          <ul className="m-0">
            {errorMessages.map((errorMessage: string) => (
              <li key={errorMessage}>
                {errorMessage}
              </li>
            ))}
          </ul>
        )}
    </Alert>
  );
}

ErrorMessageList.defaultProps = {
  className: '',
};

export default ErrorMessageList;
