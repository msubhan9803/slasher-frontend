/* eslint-disable max-lines */
import React, {
  ChangeEvent, useState, useEffect, useCallback,
} from 'react';
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
import { validateRegistrationFields } from '../../../api/users';
import useProgressButton from '../../../components/ui/ProgressButton';
import SortData from '../../../components/filter-sort/SortData';

const yearOptions = generate18OrOlderYearList();
const dayOptions = generateDayOptions(1, 31);
const monthOptions = generateMonthOptions();
interface Props {
  activeStep: number;
}

function RegistrationSecurity({ activeStep }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const securityInfo = useAppSelector((state) => state.registration);
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const navigate = useNavigate();
  const [updateDayOptions, setUpdateDayOptions] = useState(dayOptions);
  const convertedDayOptions = updateDayOptions.map((day) => ({ value: day, label: day }));
  const convertedYearOptions = yearOptions.map((year) => ({ value: year, label: year }));
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedSecurityQuestion, setSelectedSecurityQuestion] = useState<number>(0);
  const RegistartionSecurityQuestions = RegistartionSecurityList.map(
    (list) => ({ value: list, label: list }),
  );

  useEffect(() => {
    const newDay = generateDayOptions(
      1,
      31,
      selectedYear !== 0 ? selectedYear : undefined,
      selectedMonth !== 0 ? selectedMonth : undefined,
    );
    setUpdateDayOptions(newDay);
  }, [selectedMonth, selectedYear]);

  const handleChange = (value: string | number, key: string) => {
    const registerInfoTemp = { ...securityInfo };
    (registerInfoTemp as any)[key] = value;
    dispatch(setSecurityFields(registerInfoTemp));
  };

  const validateAndGoToRegistrationTerms = async () => {
    setProgressButtonStatus('loading');
    const {
      firstName, userName, email, password,
      passwordConfirmation, securityQuestion,
      securityAnswer, day, month, year,
    } = securityInfo;
    const dobIsoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let errorList: string[] = [];

    try {
      const response = await validateRegistrationFields(
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
      );
      if (response.data.length > 0) {
        errorList = errorList.concat(response.data);
      }
    } catch (error: any) {
      errorList.push(error.response.data.message);
    }

    if (errorList.length > 0) {
      setProgressButtonStatus('failure');
      setErrorMessages(errorList);
    } else {
      setProgressButtonStatus('success');
      navigate('/app/registration/terms');
    }
  };

  const handleChangeDay = useCallback(() => {
    if (selectedDay > updateDayOptions.length) {
      setSelectedDay(updateDayOptions.length);
    }
  }, [updateDayOptions.length, selectedDay]);

  useEffect(() => {
    handleChangeDay();
  }, [updateDayOptions.length, selectedDay, handleChangeDay]);

  return (
    <RegistrationPageWrapper activeStep={activeStep}>
      <form>
        <Row className="justify-content-center">
          <Col sm={12} md={9}>
            <Row>
              <Col sm={12} md={6} className="order-first">
                <InputGroup>
                  <Form.Control
                    aria-label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="rounded-2"
                    value={securityInfo.password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'password')}
                  />
                  <CustomVisibilityButton className="fw-normal text-light position-absolute border-0" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </CustomVisibilityButton>
                </InputGroup>
              </Col>
              <Col sm={12} md={6} className="order-last">
                <InputGroup>
                  <Form.Control
                    aria-label="Confirm Password"
                    value={securityInfo.passwordConfirmation}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'passwordConfirmation')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    className="rounded"
                  />
                  <CustomVisibilityButton className="fw-normal text-light position-absolute border-0" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
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
            <SortData
              sortVal={selectedSecurityQuestion}
              onSelectSort={(val) => { handleChange(val, 'securityQuestion'); setSelectedSecurityQuestion(val); }}
              sortoptions={[{ value: 0, label: 'Select a security question' }, ...RegistartionSecurityQuestions]}
              type="form"
            />
            <p className="mt-3 text-light">
              By selecting a security question, you will be able to verify that
              this is your account. This will be needed if you ever want to change
              your email address or other info.
            </p>
          </Col>
          <Col sm={12} md={9} className="mt-4">
            <Form.Group controlId="formBasicAnswer">
              <Form.Control
                aria-label="Security answer"
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
                <SortData
                  sortVal={selectedMonth}
                  onSelectSort={(val) => { handleChange(val, 'month'); setSelectedMonth(val); handleChangeDay(); }}
                  sortoptions={[{ value: 0, label: 'Month' }, ...monthOptions]}
                  type="form"
                />
              </Col>
              <Col sm={12} md={4} className="my-2 my-md-0">
                <SortData
                  sortVal={selectedDay}
                  onSelectSort={(val) => { handleChange(val, 'day'); setSelectedDay(val); }}
                  sortoptions={[{ value: 0, label: 'Day' }, ...convertedDayOptions]}
                  type="form"
                />
              </Col>
              <Col sm={12} md={4}>
                <SortData
                  sortVal={selectedYear}
                  onSelectSort={(val) => { handleChange(val, 'year'); setSelectedYear(val); }}
                  sortoptions={[{ value: 0, label: 'Year' }, ...convertedYearOptions]}
                  type="form"
                />
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
              to="/app/registration/identity"
              className="w-100"
              variant="secondary"
            >
              Previous step
            </RoundButtonLink>
          </Col>
          <Col sm={4} md={3} className="order-1 mb-3 mb-md-0 order-sm-2">
            <ProgressButton label="Next step" className="w-100" onClick={validateAndGoToRegistrationTerms} />
          </Col>
        </Row>
      </form>
    </RegistrationPageWrapper>
  );
}
export default RegistrationSecurity;
