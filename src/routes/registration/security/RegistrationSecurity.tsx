/* eslint-disable max-lines */
import React, { ChangeEvent, useState } from 'react';
import {
  Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CustomVisibilityButton } from '../../../components/ui/CustomVisibilityButton';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setSecurityFields } from '../../../redux/slices/registrationSlice';
import {
  generate18OrOlderYearList, generateMonthOptions, generateDayOptions,
} from '../../../utils/date-utils';
import RegistrationPageWrapper from '../components/RegistrationPageWrapper';
import RegistartionSecurityList from '../components/RegistrationSecurityList';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import RoundButton from '../../../components/ui/RoundButton';
import { validateRegistrationFields } from '../../../api/users';

const yearOptions = generate18OrOlderYearList();
const monthOptions = generateMonthOptions();
const dayOptions = generateDayOptions(1, 31);
interface Props {
  activeStep: number;
}

function RegistrationSecurity({ activeStep }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const securityInfo = useAppSelector((state) => state.registration);
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const navigate = useNavigate();

  const handleChange = (value: string, key: string) => {
    const registerInfoTemp = { ...securityInfo };
    (registerInfoTemp as any)[key] = value;
    dispatch(setSecurityFields(registerInfoTemp));
  };

  const validateAndGoToRegistrationTerms = async () => {
    const {
      firstName, userName, email, password,
      passwordConfirmation, securityQuestion,
      securityAnswer, day, month, year,
    } = securityInfo;
    const dobIsoString = `${year}-${month}-${day}`;
    validateRegistrationFields(
      {
        firstName,
        userName,
        email,
        password,
        passwordConfirmation,
        securityQuestion,
        securityAnswer,
        dob: dobIsoString,
      },
    ).then((res) => {
      if (res.data.length > 0) setErrorMessages(res.data);
      else navigate('/registration/terms');
    }).catch((error) => {
      setErrorMessages(error.response.data.message);
    });
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
                  value={securityInfo.password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'password')}
                />
                <CustomVisibilityButton className="fs-5 fw-normal text-light border border-start-0 shadow-none" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Hide' : 'Show'}
                </CustomVisibilityButton>
              </InputGroup>
            </Col>
            <Col sm={12} md={6} className="order-last">
              <InputGroup>
                <Form.Control
                  value={securityInfo.passwordConfirmation}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'passwordConfirmation')}
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
            value={securityInfo.securityQuestion}
            onChange={(e: ChangeEvent<{ value: string }>) => handleChange(e.target.value, 'securityQuestion')}
            aria-label="Security question selection"
          >
            <option value="" disabled className="text-light">Select a security question</option>
            {RegistartionSecurityList.map((securityQuestion: string) => (
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
              value={securityInfo.securityAnswer}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'securityAnswer')}
            />
          </Form.Group>
          <p className="text-light mt-3">Not case sensitive.</p>
        </Col>
      </Row>
      <Row className="justify-content-center mt-4">
        <Col sm={12} md={9} className="order-xs-1 ">
          <p className="mb-0">Date of birth</p>
        </Col>
        <Col sm={12} md={9} className="order-3">
          <Row>
            <Col sm={12} md={9}>
              <p className="mb-4 text-light">Your age will not be shown in your profile.</p>
            </Col>
            <Col sm={12} md={4}>
              <Form.Select
                value={securityInfo.month}
                onChange={(e: ChangeEvent<{ value: string }>) => handleChange(e.target.value, 'month')}
                aria-label="Month selection"
              >
                <option value="" disabled className="text-light">Month</option>
                {monthOptions.map((months) => (
                  <option key={months.value} value={months.value}>{months.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={12} md={4} className="my-2 my-md-0">
              <Form.Select
                value={securityInfo.day}
                onChange={(e: ChangeEvent<{ value: string }>) => handleChange(e.target.value, 'day')}
                aria-label="Day selection"
              >
                <option value="" disabled className="text-light">Day</option>
                {dayOptions.map((dayOption) => (
                  <option key={dayOption} value={dayOption}>{dayOption}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={12} md={4}>

              <Form.Select
                value={securityInfo.year}
                onChange={(e: ChangeEvent<{ value: string }>) => handleChange(e.target.value, 'year')}
                aria-label="Year selection"
              >
                <option value="" disabled className="text-light">Year</option>
                {yearOptions.map((yearOption) => (
                  <option key={yearOption} value={yearOption}>{yearOption}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="justify-content-center mt-4">
        <Col sm={12} md={9} className="order-xs-1 ">
          <ErrorMessageList errorMessages={errorMessages} />
        </Col>
      </Row>
      <Row className="justify-content-center my-4">
        <Col sm={4} md={3} className="mb-sm-0 mb-3 order-2 order-sm-1">
          <RoundButtonLink
            to="/registration/identity"
            className="w-100"
            variant="secondary"
          >
            Previous step
          </RoundButtonLink>
        </Col>
        <Col sm={4} md={3} className="order-1 mb-3 mb-md-0 order-sm-2">
          <RoundButton className="w-100" onClick={validateAndGoToRegistrationTerms}>Next step</RoundButton>
        </Col>
      </Row>
    </RegistrationPageWrapper>
  );
}
export default RegistrationSecurity;
