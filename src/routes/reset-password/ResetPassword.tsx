import React, { useState } from 'react';
import {
  Button,
  Col,
  Form,
  InputGroup,
  Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import UnauthenticatedPageWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import RoundButton from '../../components/ui/RoundButton';

const CustomVisibilityButton = styled(Button)`
  background-color: rgb(31, 31, 31);
  border-color: #3a3b46 !important;
  &:hover {
    background-color: rgb(31, 31, 31);
  }
  &:focus {
    background-color: rgb(31, 31, 31);
  }
`;

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <UnauthenticatedPageWrapper valign="center">
      <Form>
        <h1 className="text-center">Reset Your Password</h1>
        <p className="text-center mt-3 mb-4">Enter your new password below to gain access to your account again.</p>
        <Row className="justify-content-center py-2">
          <Col sm={7} md={6} xl={5}>
            <InputGroup>
              <Form.Control type={showPassword ? 'text' : 'password'} placeholder="New password" className="border-end-0" />
              <CustomVisibilityButton className="fs-5 fw-normal text-light border border-start-0 shadow-none" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </CustomVisibilityButton>
            </InputGroup>
            <p className="my-3">Your new password must be at least 8 characters and contain at least one (1) special character and at least one (1) capital letter.</p>
            <InputGroup>
              <Form.Control type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter new password" className="border-end-0" />
              <CustomVisibilityButton className="fs-5 fw-normal text-light border border-start-0 shadow-none" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </CustomVisibilityButton>
            </InputGroup>
            <RoundButton className="mt-3 w-100">Set password</RoundButton>
          </Col>
        </Row>
      </Form>
    </UnauthenticatedPageWrapper>
  );
}

export default ResetPassword;
