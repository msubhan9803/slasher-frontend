import React from 'react';
import {
  Button,
  Col, Container, Form, Row,
} from 'react-bootstrap';

function RegistrationSecurity() {
  const monthList = [
    { label: 'January', value: 'January', days: 31 },
    { label: 'Febuary', value: 'Febuary', days: 28 },
    { label: 'March', value: 'March', days: 31 },
    { label: 'April', value: 'April', days: 30 },
    { label: 'May', value: 'May', days: 31 },
    { label: 'June', value: 'June', days: 30 },
    { label: 'July', value: 'July', days: 31 },
    { label: 'August', value: 'August', days: 31 },
    { label: 'September', value: 'September', days: 30 },
    { label: 'October', value: 'October', days: 31 },
    { label: 'November', value: 'November', days: 30 },
    { label: 'December', value: 'December', days: 31 },
  ];

  const generateDayOptions = () => {
    const dayList = [];
    for (let day = 1; day <= 31; day += 1) {
      dayList.push(<option value={day}>{day}</option>);
    }
    return dayList;
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const endYear = currentYear - 18;
    const startYear = endYear - 29;
    const yearList = [];
    for (let year = startYear; year <= endYear; year += 1) {
      yearList.push(<option value={year}>{year}</option>);
    }
    return yearList;
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
          <Form.Select aria-label="Default select example">
            <option value="" disabled selected hidden>Select a security question</option>
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
              <Form.Select aria-label="Default select example">
                <option value="" disabled selected>Month</option>
                {monthList.map((month) => <option value={month.label}>{month.value}</option>)}
              </Form.Select>
            </Col>
            <Col sm={12} md={4} className="my-2">
              <Form.Select aria-label="Default select example">
                <option value="" disabled selected>Day</option>
                {generateDayOptions()}
              </Form.Select>
            </Col>
            <Col sm={12} md={4} className="my-2">
              <Form.Select aria-label="Default select example">
                <option value="" disabled selected>Year</option>
                {generateYearOptions()}
              </Form.Select>
            </Col>
            <p className="mt-3">Your age will not be shown in your profile.</p>
            <Col sm={12} md={9} className="mt-3">
              <Button variant="primary" type="submit" className="w-50 px-5">
                Next Step
              </Button>
            </Col>
          </Row>
        </Col>
        <Col />
      </Row>

    </Container>
  );
}
export default RegistrationSecurity;
