import React from 'react';
import { Alert } from 'react-bootstrap';

interface MessageProps {
  errorMessages: string[] | undefined;
  className?: string;
  divClass?: string;
}
function ErrorMessageList({ errorMessages, className, divClass }: MessageProps) {
  return (
    <div>
      {errorMessages && errorMessages.length > 0 && (
        <div className={divClass}>
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
        </div>
      )}
    </div>

  );
}

ErrorMessageList.defaultProps = {
  className: '',
  divClass: '',
};

export default ErrorMessageList;
