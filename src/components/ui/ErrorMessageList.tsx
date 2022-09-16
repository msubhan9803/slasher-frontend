import React from 'react';
import { Alert } from 'react-bootstrap';

interface MessageProps {
  errorMessages: string[];
}
function ErrorMessageList({ errorMessages }: MessageProps) {
  return (
    <Alert className="m-0">
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

export default ErrorMessageList;
