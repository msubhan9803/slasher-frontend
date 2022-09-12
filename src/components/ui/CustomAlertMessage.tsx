import React from 'react';
import { Alert } from 'react-bootstrap';

interface AlertMessageProps {
  errorMessage: MessageProps;
}
interface MessageProps {
  message: string;
  type: string;
}
function CustomAlertMessage({ errorMessage }: AlertMessageProps) {
  return (
    <Alert variant={errorMessage.type}>{errorMessage.message}</Alert>
  );
}

export default CustomAlertMessage;
