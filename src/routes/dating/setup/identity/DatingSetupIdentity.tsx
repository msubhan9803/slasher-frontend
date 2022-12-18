/* eslint-disable max-lines */
import React, { useState } from 'react';
import {
  Button,
  Col, Form, Row,
} from 'react-bootstrap';
import RoundButton from '../../../../components/ui/RoundButton';
import { generate18OrOlderYearList, generateMonthOptions, generateDayOptions } from '../../../../utils/date-utils';
import DatingPageWrapper from '../../components/DatingPageWrapper';

const yearOptions = generate18OrOlderYearList();
const monthOptions = generateMonthOptions();
const dayOptions = generateDayOptions(1, 31);

function DatingSetupIdentity() {
  const [gender, setGender] = useState('male');
  const [selectGender, setSelectGender] = useState('');

  return (
    <DatingPageWrapper>
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
              <Form.Select aria-label="Month selection" defaultValue="">
                <option value="" disabled>
                  Month
                </option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={12} md={4} className="mb-3">
              <Form.Select aria-label="Day selection" defaultValue="">
                <option value="" disabled>
                  Day
                </option>
                {dayOptions.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={12} md={4} className="mb-3">
              <Form.Select aria-label="Year selection" defaultValue="">
                <option value="" disabled>
                  Year
                </option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Col>
        <Col />
      </Row>
      <Row className="mt-3 mb-4">
        <Col sm={6}>
          <Row>
            <h1>I am a</h1>
            <Row>
              <Col xs={6} md={4} sm={4} lg={4}>
                <Button
                  variant="form"
                  className="w-100"
                  name="male"
                  active={gender === 'male'}
                  onClick={(e: any) => setGender((e.target as HTMLButtonElement).name)}
                >
                  Male
                </Button>
              </Col>
              <Col xs={6} md={4} sm={4} lg={4}>
                <Button
                  variant="form"
                  className="w-100"
                  name="female"
                  active={gender === 'female'}
                  onClick={(e: any) => setGender((e.target as HTMLButtonElement).name)}
                >
                  Female
                </Button>
              </Col>
            </Row>
          </Row>
        </Col>
      </Row>
      <Row className="mt-3 mb-4">
        <Col md={6}>
          <Row>
            <h1> I am looking for</h1>
            <Row>
              <Col xs={4}>
                <Button
                  variant="form"
                  className="w-100"
                  name="men"
                  active={selectGender === 'men'}
                  onClick={(e: any) => setSelectGender((e.target as HTMLButtonElement).name)}
                >
                  Men
                </Button>
              </Col>
              <Col xs={4}>
                <Button
                  variant="form"
                  className="w-100"
                  name="women"
                  active={selectGender === 'women'}
                  onClick={(e: any) => setSelectGender((e.target as HTMLButtonElement).name)}
                >
                  Women
                </Button>
              </Col>
              <Col xs={4}>
                <Button
                  variant="form"
                  className="w-100"
                  name="both"
                  active={selectGender === 'both'}
                  onClick={(e: any) => setSelectGender((e.target as HTMLButtonElement).name)}
                >
                  Both
                </Button>
              </Col>
            </Row>
          </Row>
        </Col>
      </Row>
      <Row className="mt-3">
        <p>My sexual orientation is</p>
        <Col sm={12} md={4} className="">
          <Form.Select aria-label="Sexual orientation selection" defaultValue="">
            <option value="" disabled>Select One</option>
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
          <RoundButton
            variant="primary"
            type="submit"
            className="w-100 px-5"
          >
            Next Step
          </RoundButton>
        </Col>
      </Row>
    </DatingPageWrapper>
  );
}
export default DatingSetupIdentity;
