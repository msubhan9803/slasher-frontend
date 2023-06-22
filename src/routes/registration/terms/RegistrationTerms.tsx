import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Col,
  Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { register } from '../../../api/users';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import useProgressButton from '../../../components/ui/ProgressButton';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import { useAppSelector } from '../../../redux/hooks';
import RegistrationPageWrapper from '../components/RegistrationPageWrapper';
import { WORDPRESS_SITE_URL } from '../../../constants';

interface Props {
  activeStep: number;
}

function RegistrationTerms({ activeStep }: Props) {
  const navigate = useNavigate();
  const registrationInfo = useAppSelector((state) => state.registration);
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [showAgreeToTermsError, setShowAgreeToTermsError] = useState(false);
  const [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const captchaRef = useRef<HCaptcha>(null);

  useEffect(() => {
    captchaRef?.current?.resetCaptcha();
  }, []);

  const submitRegister = async () => {
    setErrorMessages([]);
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
        hCaptchaToken!,
      );

      setProgressButtonStatus('success');
      setErrorMessages([]);
      navigate('/app/registration/final');
    } catch (error: any) {
      setProgressButtonStatus('failure');
      setErrorMessages(error.response.data.message);
    }
  };

  const handleVerificationSuccess = (token: string) => {
    setHCaptchaToken(token);
  };

  const handleCheckbox = () => {
    setIsAgreedToTerms(!isAgreedToTerms);
    setShowAgreeToTermsError(isAgreedToTerms);
  };
  return (
    <RegistrationPageWrapper activeStep={activeStep}>
      <Row className="justify-content-center mt-2">
        <Col sm={12} md={8} lg={6}>
          <p className="pt-5">
            By signing up, you agree that you are at least 18 years of age,
            and that you agree to our
            {' '}
            <a target="_blank" rel="noreferrer" href={`${WORDPRESS_SITE_URL}/terms-and-conditions`}>Terms and Conditions</a>
            ,
            {' '}
            <a target="_blank" rel="noreferrer" href={`${WORDPRESS_SITE_URL}/privacy-policy`}>Privacy Policy</a>
            ,
            {' '}
            <a target="_blank" rel="noreferrer" href={`${WORDPRESS_SITE_URL}/eula`}>End User License Agreement</a>
            , and
            {' '}
            <a target="_blank" rel="noreferrer" href={`${WORDPRESS_SITE_URL}/rules`}>Community Standards</a>
            .
          </p>
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
              I agree to these terms and policies
            </label>
          </div>
          <div className="mt-2">
            {showAgreeToTermsError && <Alert variant="danger">You must check the checkbox above and agree to these terms if you want to sign up.</Alert>}
          </div>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col className="justify-content-center d-flex">
          <HCaptcha
            sitekey="aade8ad0-8a3e-4f80-9aba-9c4d03e7806c"
            onVerify={(token) => handleVerificationSuccess(token)}
            ref={captchaRef}
          />
        </Col>
      </Row>
      <Row className="justify-content-center my-5">
        <ErrorMessageList errorMessages={errorMessages} />
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
