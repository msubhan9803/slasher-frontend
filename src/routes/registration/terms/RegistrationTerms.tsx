import React, { useState } from 'react';
import {
  Alert,
  Col,
  Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { register } from '../../../api/users';
import CommunityStandardsAndRules from '../../../components/terms-and-policies/CommunityStandardsAndRules';
import EndUserLicenseAgreement from '../../../components/terms-and-policies/EndUserLicenseAgreement';
import PrivacyPolicy from '../../../components/terms-and-policies/PrivacyPolicy';
import TermsAndConditions from '../../../components/terms-and-policies/TermsAndConditions';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import useProgressButton from '../../../components/ui/ProgressButton';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import { useAppSelector } from '../../../redux/hooks';
import RegistrationPageWrapper from '../components/RegistrationPageWrapper';

interface Props {
  activeStep: number;
}

function RegistrationTerms({ activeStep }: Props) {
  const navigate = useNavigate();
  const registrationInfo = useAppSelector((state) => state.registration);
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [showAgreeToTermsError, setShowAgreeToTermsError] = useState(false);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();

  const submitRegister = async () => {
    if (!isAgreedToTerms) {
      setShowAgreeToTermsError(true);
      return;
    }

    setProgressButtonStatus('loading');

    const {
      firstName, userName, email, password,
      passwordConfirmation, securityQuestion,
      securityAnswer, day, month, year,
    } = registrationInfo;
    const dobIsoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    try {
      await register(
        firstName,
        userName,
        email,
        password,
        passwordConfirmation,
        securityQuestion,
        securityAnswer,
        dobIsoString,
      );

      setProgressButtonStatus('success');
      setErrorMessages([]);
      navigate('/app/registration/final');
    } catch (error: any) {
      setProgressButtonStatus('failure');
      setErrorMessages(error.response.data.message);
    }
  };

  const handleCheckbox = () => {
    setIsAgreedToTerms(!isAgreedToTerms);
    setShowAgreeToTermsError(isAgreedToTerms);
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
      <p className="border-top pt-5">
        By signing up, you agree that you are at least 17 years of age, and that you agree
        to our Terms and Conditions, Privacy Policy, End User License Agreement, and Community
        Standards.
      </p>
      <ErrorMessageList errorMessages={errorMessages} />
      <div className="mt-1">
        <label htmlFor="term-agreement-checkbox" className="h2">
          <input
            id="term-agreement-checkbox"
            type="checkbox"
            checked={isAgreedToTerms}
            onChange={handleCheckbox}
            onKeyDown={(e) => { if (e.key === 'Enter') { handleCheckbox(); } }}
            className="me-2"
          />
          I agree to these terms
        </label>
      </div>
      <div className="mt-2">
        {showAgreeToTermsError && <Alert variant="danger">You must check the checkbox above and agree to these terms if you want to sign up.</Alert>}
      </div>
      <Row className="justify-content-center my-5">
        <Col sm={4} md={3} className="mb-sm-0 mb-3 order-2 order-sm-1">
          <RoundButtonLink
            to="/app/registration/security"
            className="w-100"
            variant="secondary"
          >
            Previous step
          </RoundButtonLink>
        </Col>
        <Col sm={4} md={3} className="order-1 mb-3 mb-md-0 order-sm-2">
          <ProgressButton label="Next step" className="w-100" onClick={() => submitRegister()} />
        </Col>
      </Row>
    </RegistrationPageWrapper>
  );
}

export default RegistrationTerms;
