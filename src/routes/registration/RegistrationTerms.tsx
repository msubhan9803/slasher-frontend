import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CommunityStandardsAndRules from '../../components/terms-and-policies/CommunityStandardsAndRules';
import EndUserLicenseAgreement from '../../components/terms-and-policies/EndUserLicenseAgreement';
import PrivacyPolicy from '../../components/terms-and-policies/PrivacyPolicy';
import TermsAndConditions from '../../components/terms-and-policies/TermsAndConditions';
import RoundButton from '../../components/ui/RoundButton';

function RegistrationTerms({ changeStep }: any) {
  const navigate = useNavigate();
  const handleStep = () => {
    navigate('/registration/final');
    changeStep(3);
  };
  return (
    <Container>
      <h1 className="h3">
        Please scroll down to review our Terms and Conditions,
        Privacy Policy, End User License Agreement, and Community Standards
      </h1>
      <TermsAndConditions className="mt-5" />
      <PrivacyPolicy className="mt-5" />
      <EndUserLicenseAgreement className="mt-5" />
      <CommunityStandardsAndRules className="mt-5" />
      <h1 className="h3 mt-5">I agree</h1>
      <p>
        By clicking Sign up, you agree that you are at least 17 years of age, and that you agree
        with our Terms and Conditions, Privacy Policy, End User License Agreement, and Community
        Standards.
      </p>
      <Row className="mt-5">
        <Col sm={4} md={3} className="mb-sm-0 mb-3">
          <RoundButton onClick={() => { changeStep(1); navigate('/registration/security'); }} className="w-100" variant="secondary" type="submit">
            Previous step
          </RoundButton>
        </Col>
        <Col sm={4} md={3}>
          <RoundButton onClick={handleStep} className="w-100" type="submit">
            Sign up
          </RoundButton>
        </Col>
      </Row>
    </Container>
  );
}

export default RegistrationTerms;
