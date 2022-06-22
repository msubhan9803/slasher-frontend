import React from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import RoundButton from '../../../components/ui/RoundButton';
import { generate18OrOlderYearList, generateMonthOptions, generateDayOptions } from '../../../utils/date-utils';
import RegistrationPageWrapper from '../components/RegistrationPageWrapper';

const yearOptions = generate18OrOlderYearList();
const monthOptions = generateMonthOptions();
const dayOptions = generateDayOptions(1, 31);

interface Props {
  activeStep: number;
}

function RegistrationSecurity({ activeStep }: Props) {
  const navigate = useNavigate();
  const handleStep = () => {
    navigate('/registration/terms');
  };

  return (
    <RegistrationPageWrapper activeStep={activeStep}>
      <Row className="justify-content-center">
        <Col sm={12} md={9}>
          <Row>
            <Col sm={12} md={6} className="order-first">
              <Form.Group controlId="formBasicPassword">
                <Form.Control type="text" placeholder="Password" />
              </Form.Group>
            </Col>
            <Col sm={12} md={6} className="order-last">
              <Form.Group controlId="formBasicPasswordConfirmation">
                <Form.Control type="text" placeholder="Confirm Password" />
              </Form.Group>
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
          <Form.Select aria-label="Security question selection" defaultValue="">
            <option value="" disabled className="text-light">Select a security question</option>
            <option value="1">The number of the first house you lived in</option>
            <option value="2">Your favorite color</option>
            <option value="4">The brand of the first car you owned</option>
            <option value="5">Your favorite movie</option>
            <option value="6">The name of the first street you lived on</option>
            <option value="7">The first name of your best friend in high school</option>
            <option value="8">The first name of the person you went on your first date with</option>
            <option value="9">Your favorite band</option>
            <option value="10">Your favorite book</option>
          </Form.Select>
          <p className="mt-3 text-light">
            By selecting a security question, you will be able to verify that
            this is your account. This will be needed if you ever want to change
            your email address or other info.
          </p>
        </Col>
        <Col sm={12} md={9} className="mt-4">
          <Form.Group controlId="formBasicAnswer">
            <Form.Control type="text" placeholder="Security answer" />
          </Form.Group>
          <p className="text-light mt-3">Not case sensitive.</p>
        </Col>
      </Row>
      <Row className="justify-content-center mt-4">
        <Col sm={12} lg={9} className="order-xs-1 ">
          <p>Date of birth</p>
        </Col>
        <Col sm={12} lg={9} className="order-3">
          <Row>
            <Col sm={12} md={4}>
              <Form.Select aria-label="Month selection" defaultValue="">
                <option value="" disabled className="text-light">Month</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={12} md={4} className="my-2 my-md-0">
              <Form.Select aria-label="Day selection" defaultValue="">
                <option value="" disabled className="text-light">Day</option>
                {dayOptions.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={12} md={4}>
              <Form.Select aria-label="Year selection" defaultValue="">
                <option value="" disabled className="text-light">Year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Col>
        <Col sm={12} lg={9} className="order-md-3">
          <p className="mb-3 mt-md-3 mb-md-0 text-light">Your age will not be shown in your profile and you cannot change your date of birth later.</p>
        </Col>
      </Row>
      <Row className="justify-content-center my-5">
        <Col sm={4} className="mb-2 mb-md-0">
          <RoundButton onClick={() => { navigate('/registration/identity'); }} className="w-100" variant="secondary" type="submit">
            Previous step
          </RoundButton>
        </Col>
        <Col sm={4}>
          <RoundButton onClick={handleStep} className="w-100" type="submit">
            Next step
          </RoundButton>
        </Col>
      </Row>
    </RegistrationPageWrapper>
  );
}
export default RegistrationSecurity;
