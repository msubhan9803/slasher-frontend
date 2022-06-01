import React from 'react';
import {
  Col, Container, Form, Row,
} from 'react-bootstrap';
import { Info } from 'luxon';
import { useNavigate } from 'react-router-dom';
import RoundButton from '../../components/ui/RoundButton';
import { generateRange } from '../../utils/array-utils';

const generateMonthOptions = () => {
  const monthNumbers = Info.months('numeric').map((monthNumber: string) => parseInt(monthNumber, 10));
  const monthNames = Info.months('long'); // Using luxon for eventual month name locale awareness
  const monthOptions: { value: number, label: string }[] = [];
  monthNumbers.forEach((monthNumber: number, i: number) => {
    monthOptions.push({ value: monthNumber, label: monthNames[i] });
  });
  return monthOptions;
};
const generateDayOptions = () => generateRange(1, 31).map(
  (day) => <option key={day} value={day}>{day}</option>,
);
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const endYear = currentYear - 18;
  const startYear = currentYear - 100;
  return generateRange(endYear, startYear).map(
    (year) => <option key={year} value={year}>{year}</option>,
  );
};

const yearOptions = generateYearOptions();
const monthOptions = generateMonthOptions();
const dayOptions = generateDayOptions();

function RegistrationSecurity({ changeStep }: any) {
  const navigate = useNavigate();
  const handleStep = () => {
    navigate('/registration/terms');
    changeStep(2);
  };

  return (
    <Container>
      <Row>
        <Col sm={12} md={9}>
          <Row>
            <Col sm={12} md={6} className="order-first">
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Control type="text" placeholder="Password" />
              </Form.Group>
            </Col>
            <Col sm={12} md={6} className="order-last">
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Control type="text" placeholder="Confirm Password" />
              </Form.Group>
            </Col>
            <Col className="order-md-last">
              <p>
                Your password must be at least 8 characters and contain at least one (1)
                special character and at least one (1) capital letter.
              </p>
            </Col>
          </Row>
        </Col>
        <Col sm={12} md={9} className="mt-3">
          <Form.Select aria-label="Security question selection" defaultValue="">
            <option value="" disabled>Select a security question</option>
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
          <p className="mt-3">
            By selecting a security question, you will be able to verify that
            this is your account. This will be needed if you ever want to change
            your email address or other info.
          </p>
        </Col>
        <Col sm={12} md={9} className="mt-3">
          <Form.Group className="mb-3" controlId="formBasicAnswer">
            <Form.Control type="text" placeholder="Security answer" />
          </Form.Group>
          <p>Not case sensitive. </p>
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={9} className="mt-3">
          <Row>
            <p>Date of birth</p>
            <Col sm={12} md={4} className="my-2">
              <Form.Select aria-label="Month selection" defaultValue="">
                <option value="" disabled>Month</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={12} md={4} className="my-2">
              <Form.Select aria-label="Day selection" defaultValue="">
                <option value="" disabled>Day</option>
                {dayOptions}
              </Form.Select>
            </Col>
            <Col sm={12} md={4} className="my-2">
              <Form.Select aria-label="Year selection" defaultValue="">
                <option value="" disabled>Year</option>
                {yearOptions}
              </Form.Select>
            </Col>
            <p className="mt-3">Your age will not be shown in your profile.</p>
            <Row>
              <Col sm={4}>
                <RoundButton onClick={() => { changeStep(0); navigate('/registration/identity'); }} className="w-100" variant="secondary" type="submit">
                  Previous step
                </RoundButton>
              </Col>
              <Col sm={4}>
                <RoundButton onClick={handleStep} className="w-100" type="submit">
                  Next step
                </RoundButton>
              </Col>
            </Row>
          </Row>
        </Col>
        <Col />
      </Row>
    </Container>
  );
}
export default RegistrationSecurity;
