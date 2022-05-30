import React, { useState } from 'react';
import {
  Button, Col, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import UnauthenticatedSiteWrapper from '../../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';

const StyledButton = styled(Button)`
  background-color: #1f1f1f;
  border-radius: 10px;
  border: 1px solid #3a3b46; 
`;
function DatingSetupIdentity() {
  const [gender, setGender] = useState('male');
  const [selectGender, setSelectGender] = useState('');
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
    <UnauthenticatedSiteWrapper>
      <Row>
        <Col md={5}>
          <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label className="d-none d-sm-block ">First Name</Form.Label>
            <Form.Control type="text" placeholder="Enter First Name" />
          </Form.Group>
          <p>
            Please use your first name only. This is recommended for your
            privacy and safety.
          </p>
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={9} className="mt-3">
          <Row>
            <p>Date of birth</p>
            <Col sm={12} md={4} className="mb-3">
              <Form.Select aria-label="Default select example">
                <option value="" disabled selected>
                  Month
                </option>
                {monthList.map((month) => (
                  <option value={month.label}>{month.value}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={12} md={4} className="mb-3">
              <Form.Select aria-label="Default select example">
                <option value="" disabled selected>
                  Day
                </option>
                {generateDayOptions()}
              </Form.Select>
            </Col>
            <Col sm={12} md={4} className="mb-3">
              <Form.Select aria-label="Default select example">
                <option value="" disabled selected>
                  Year
                </option>
                {generateYearOptions()}
              </Form.Select>
            </Col>
          </Row>
        </Col>
        <Col />
      </Row>
      <Row className="mt-3 mb-4">
        <Col sm={6}>
          <Row>
            <h3>I am a</h3>
            <Row>
              <Col xs={6} md={4} sm={4} lg={4}>
                <StyledButton
                  size="lg"
                  className="w-100 text-light"
                  name="male"
                  active={gender === 'male'}
                  onClick={(e: any) => setGender(e.target.name)}
                >
                  Male
                </StyledButton>
              </Col>
              <Col xs={6} md={4} sm={4} lg={4}>
                <StyledButton
                  size="lg"
                  className="w-100 text-light"
                  name="female"
                  active={gender === 'female'}
                  onClick={(e: any) => setGender(e.target.name)}
                >
                  Female
                </StyledButton>
              </Col>
            </Row>
          </Row>
        </Col>
      </Row>
      <Row className="mt-3 mb-4">
        <Col md={6}>
          <Row>
            <h3> I am looking for</h3>
            <Row>
              <Col xs={4}>
                <StyledButton
                  size="lg"
                  className="w-100 text-light"
                  name="men"
                  active={selectGender === 'men'}
                  onClick={(e: any) => setSelectGender(e.target.name)}
                >
                  Men
                </StyledButton>
              </Col>
              <Col xs={4}>
                <StyledButton
                  size="lg"
                  className="w-100 text-light"
                  name="women"
                  active={selectGender === 'women'}
                  onClick={(e: any) => setSelectGender(e.target.name)}
                >
                  Women
                </StyledButton>
              </Col>
              <Col xs={4}>
                <StyledButton
                  size="lg"
                  className="w-100 text-light"
                  name="both"
                  active={selectGender === 'both'}
                  onClick={(e: any) => setSelectGender(e.target.name)}
                >
                  Both
                </StyledButton>
              </Col>
            </Row>
          </Row>
        </Col>
      </Row>
      <Row className="mt-3">
        <p>My sexual orientation is</p>
        <Col sm={12} md={4} className="">
          <Form.Select aria-label="Default select example">
            <option value="" disabled selected>Select One</option>
            <option value="Straight">Straight</option>
            <option value="Gay">Gay</option>
            <option value="Lesbian">Lesbian</option>
            <option value="Bisexual">Bisexual</option>
            <option value="Asexual">Asexual</option>
            <option value="Demisexual">Demisexual</option>
            <option value="Pansexual">Pansexual</option>
            <option value="Queer">Queer</option>
            <option value="Questioning">Questioning</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </Form.Select>
          <p className="mt-2">
            This will display on your profile, unless you choose “Prefer not to
            say”.
          </p>
        </Col>
      </Row>
      <Row>
        <Col md={4} className="mt-3">
          <Button variant="primary" type="submit" className="w-100 px-5">
            Next Step
          </Button>
        </Col>
      </Row>
    </UnauthenticatedSiteWrapper>
  );
}
export default DatingSetupIdentity;
