import React, { useState } from 'react';
import {
  Alert,
  Col,
  Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
  const [userHasAgreedToTerms, setUserHasAgreedToTerms] = useState(false);
  const [isAlert, setAlert] = useState(false);

  const handleSignup = () => (userHasAgreedToTerms ? navigate('/registration/final') : setAlert(true));
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
      <p className="border-top pt-5">
        By signing up, you agree that you are at least 17 years of age, and that you agree
        to our Terms and Conditions, Privacy Policy, End User License Agreement, and Community
        Standards.
      </p>
      <div className="mt-1">
        <label htmlFor="term-agreement-checkbox" className="h2">
          <input
            id="term-agreement-checkbox"
            type="checkbox"
            checked={userHasAgreedToTerms}
            onChange={() => setUserHasAgreedToTerms(!userHasAgreedToTerms)}
            className="me-2"
          />
          I agree to these terms
        </label>
      </div>
      <div className="mt-2">
        {isAlert && <Alert variant="info">You must check the checkbox above and agree to these terms if you want to sign up.</Alert>}
      </div>
      <Row className="justify-content-center my-5">
        <Col sm={4} md={3} className="mb-sm-0 mb-3">
          <RoundButtonLink to="/registration/security" className="w-100" variant="secondary">
            Previous step
          </RoundButtonLink>
        </Col>
        <Col sm={4} md={3}>
          <RoundButton className="w-100" onClick={handleSignup}>
            Sign up
          </RoundButton>
        </Col>
      </Row>
    </RegistrationPageWrapper>
  );
}

export default RegistrationTerms;
