import React from 'react';
import { Col } from 'react-bootstrap';
import styled from 'styled-components';
import CustomText from '../CustomText';
import PaypalImage from '../../../images/paypal-icon.png';

const StyledButton = styled.div`
  background-color: #FFC439;
  border-radius: 10px;
  width: 12.5rem;
  height: 42px;
  border: none;
  padding: 10px;
  font-size: 16px;
  display: flex;
  justify-content: center;
  margin-top: 12px;

  @media (max-width: 576px) {
    width: 100%;
  }
`;

function PaypalButton() {
  return (
    <StyledButton>
      <img src={PaypalImage} width="50" alt="paypal button" />
    </StyledButton>
  );
}

export default function PaymentInfo() {
  return (
    <Col xs="12" className="my-2">
      <h2 className="fw-bold my-2">Payment information</h2>

      <CustomText
        text="Pay by credit card via PayPal. A PayPal account is not required."
        textColor="#DBDBDB"
        textClass="mb-0 fs-4 mb-2 fw-bold"
      />

      <PaypalButton />
    </Col>
  );
}
