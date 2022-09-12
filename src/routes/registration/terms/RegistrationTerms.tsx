import React, { useState } from 'react';
import {
  Alert,
  Col,
  Row,
} from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import CommunityStandardsAndRules from '../../../components/terms-and-policies/CommunityStandardsAndRules';
import EndUserLicenseAgreement from '../../../components/terms-and-policies/EndUserLicenseAgreement';
import PrivacyPolicy from '../../../components/terms-and-policies/PrivacyPolicy';
import TermsAndConditions from '../../../components/terms-and-policies/TermsAndConditions';
import RoundButton from '../../../components/ui/RoundButton';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import RegistrationPageWrapper from '../components/RegistrationPageWrapper';

interface Props {
  activeStep: number;
}

function RegistrationTerms({ activeStep }: Props) {
  const navigate = useNavigate();
  const { state }: any = useLocation();
  const [errorMessage, setErrorMessage] = useState<any>();

  const submitRegister = (registerInfo: any) => {
    fetch(`${process.env.REACT_APP_API_URL}users/register`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerInfo),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.message) setErrorMessage(res.message);
        if (!res.message) {
          navigate('/registration/final', { state: registerInfo });
        }
      });
  };
  return (
    <RegistrationPageWrapper activeStep={activeStep}>
      <p className="fs-3 mb-5">
        Please scroll down to review our Terms and Conditions,
        Privacy Policy, End User License Agreement, and Community Standards
      </p>
      <TermsAndConditions className="my-5" />
      <PrivacyPolicy className="my-5" />
      <EndUserLicenseAgreement className="my-5" />
      <CommunityStandardsAndRules className="my-5" />
      <h2 className="my-4 border-bottom pb-2">I agree</h2>
      <p>
        By clicking Sign up, you agree that you are at least 17 years of age, and that you agree
        with our Terms and Conditions, Privacy Policy, End User License Agreement, and Community
        Standards.
      </p>
      {errorMessage && errorMessage.map((errors: any) => (
        <Alert key="danger" variant="danger">
          {errors}
        </Alert>
      ))}
      <Row className="justify-content-center my-5">
        <Col sm={4} md={3} className="mb-sm-0 mb-3">
          <RoundButtonLink
            state={state}
            to="/registration/security"
            className="w-100"
            variant="secondary"
          >
            Previous step
          </RoundButtonLink>
        </Col>
        <Col sm={4} md={3}>
          <RoundButton className="mb-3 w-100" onClick={() => submitRegister(state)}>Sign up</RoundButton>
        </Col>
      </Row>
    </RegistrationPageWrapper>
  );
}

export default RegistrationTerms;
