import React, { useState } from 'react';
import {
  Button, Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import RegistrationPageWrapper from '../components/RegistrationPageWrapper';

interface Props {
  activeStep: number;
}
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

const securityQuestionList = [
  'The number of the first house you lived in',
  'Your favorite color',
  'The brand of the first car you owned',
  'Your favorite movie',
  'The name of the first street you lived on',
  'The first name of your best friend in high school',
  'The first name of the person you went on your first date with',
  'Your favorite band',
  'Your favorite book',
];

function RegistrationSecurity({ activeStep }: Props) {
  const { state }: any = useLocation();
  const [registerInfo, setRegisterInfo] = useState({
    ...state,
    password: state.password || '',
    passwordConfirmation: state.passwordConfirmation || '',
    securityQuestion: state.securityQuestion || '',
    securityAnswer: state.securityAnswer || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (value: string, key: string) => {
    const registerInfoTemp = { ...registerInfo };
    (registerInfoTemp as any)[key] = value;
    setRegisterInfo(registerInfoTemp);
  };

  return (
    <RegistrationPageWrapper activeStep={activeStep}>
      <Row className="justify-content-center">
        <Col sm={12} md={9}>
          <Row>
            <Col sm={12} md={6} className="order-first">
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="border-end-0"
                  value={registerInfo.password}
                  onChange={(e: any) => handleChange(e.target.value, 'password')}
                />
                <CustomVisibilityButton className="fs-5 fw-normal text-light border border-start-0 shadow-none" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Hide' : 'Show'}
                </CustomVisibilityButton>
              </InputGroup>
            </Col>
            <Col sm={12} md={6} className="order-last">
              <InputGroup>
                <Form.Control
                  value={registerInfo.passwordConfirmation}
                  onChange={(e: any) => handleChange(e.target.value, 'passwordConfirmation')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className="border-end-0"
                />
                <CustomVisibilityButton className="fs-5 fw-normal text-light border border-start-0 shadow-none" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </CustomVisibilityButton>
              </InputGroup>
            </Col>
            <Col className="order-md-last">
              <p className="text-light mt-3">
                Your password must be at least 8 characters and contain at least one (1)
                special character and at least one (1) capital letter.
              </p>
            </Col>
          </Row>
        </Col>
        <Col sm={12} md={9} className="mt-4">
          <Form.Select
            value={registerInfo.securityQuestion}
            onChange={(e: any) => handleChange(e.target.value, 'securityQuestion')}
            aria-label="Security question selection"
            defaultValue=""
          >
            <option value="" disabled className="text-light">Select a security question</option>
            {securityQuestionList.map((securityQuestion) => (
              <option key={securityQuestion} value={securityQuestion}>{securityQuestion}</option>
            ))}
          </Form.Select>
          <p className="mt-3 text-light">
            By selecting a security question, you will be able to verify that
            this is your account. This will be needed if you ever want to change
            your email address or other info.
          </p>
        </Col>
        <Col sm={12} md={9} className="mt-4">
          <Form.Group controlId="formBasicAnswer">
            <Form.Control
              type="text"
              placeholder="Security answer"
              value={registerInfo.securityAnswer}
              onChange={(e: any) => handleChange(e.target.value, 'securityAnswer')}
            />
          </Form.Group>
          <p className="text-light mt-3">Not case sensitive.</p>
        </Col>
      </Row>
      <Row className="justify-content-center my-5">
        <Col sm={4} md={3} className="mb-sm-0 mb-3">
          <RoundButtonLink
            state={state}
            to="/registration/identity"
            className="w-100"
            variant="secondary"
          >
            Previous step
          </RoundButtonLink>
        </Col>
        <Col sm={4} md={3}>
          <RoundButtonLink
            state={registerInfo}
            to="/registration/terms"
            variant="primary"
            className="w-100"
          >
            Next step
          </RoundButtonLink>
        </Col>
      </Row>
    </RegistrationPageWrapper>
  );
}
export default RegistrationSecurity;
