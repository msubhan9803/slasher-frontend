import React from 'react';
import ErrorMessageList from './ErrorMessageList';

interface ErrorMessageProps {
  errorMessage: string[] | undefined;
}

function ErrorMessage({ errorMessage }: ErrorMessageProps) {
  return (
    <div>
      {errorMessage && errorMessage.length > 0 && (
        <div className="mt-3 text-start">
          <ErrorMessageList errorMessages={errorMessage} className="m-0" />
        </div>
      )}
    </div>
  );
}

export default ErrorMessage;
