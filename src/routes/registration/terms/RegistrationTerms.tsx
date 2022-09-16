import React, { useState } from 'react';
import {
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
import RoundButton from '../../../components/ui/RoundButton';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import { useAppSelector } from '../../../redux/hooks';
import RegistrationPageWrapper from '../components/RegistrationPageWrapper';

interface Props {
  activeStep: number;
}

function RegistrationTerms({ activeStep }: Props) {
  const registrationInfo = useAppSelector((state) => state.registration);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const submitRegister = () => {
    const {
      firstName, userName, email, password,
      passwordConfirmation, securityQuestion,
      securityAnswer, day, month, year,
    } = registrationInfo;
    const dobDate = `${year}-${month}-${day}`;
    register(
      firstName,
      userName,
      email,
      password,
      passwordConfirmation,
      securityQuestion,
      securityAnswer,
      dobDate,
    ).then(() => {
      setErrorMessage([]);
      navigate('/registration/final');
    }).catch((error) => {
      setErrorMessage(error.response.data.message);
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
      {errorMessage && <ErrorMessageList errorMessages={errorMessage} />}
      <Row className="justify-content-center my-5">
        <Col sm={4} md={3} className="mb-sm-0 mb-3 order-2 order-sm-1">
          <RoundButtonLink
            to="/registration/security"
            className="w-100"
            variant="secondary"
          >
            Previous step
          </RoundButtonLink>
        </Col>
        <Col sm={4} md={3} className="order-1 mb-3 mb-md-0 order-sm-2">
          <RoundButton className="mb-3 w-100" onClick={() => submitRegister()}>Sign up</RoundButton>
        </Col>
      </Row>
    </RegistrationPageWrapper>
  );
}

export default RegistrationTerms;
