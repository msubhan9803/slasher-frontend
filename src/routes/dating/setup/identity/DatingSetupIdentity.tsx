/* eslint-disable max-lines */
import React, { useState } from 'react';
import {
  Button,
  Col, Form, Row,
} from 'react-bootstrap';
import RoundButton from '../../../../components/ui/RoundButton';
import { generate18OrOlderYearList, generateMonthOptions, generateDayOptions } from '../../../../utils/date-utils';
import DatingPageWrapper from '../../components/DatingPageWrapper';
import CustomSelect from '../../../../components/filter-sort/CustomSelect';

const yearOptions = generate18OrOlderYearList();
const monthOptions = generateMonthOptions();
const dayOptions = generateDayOptions(1, 31);
const sexualOrientationOptions = [
  { value: 'Straight', label: 'Straight' },
  { value: 'Gay', label: 'Gay' },
  { value: 'Lesbian', label: 'Lesbian' },
  { value: 'Bisexual', label: 'Bisexual' },
  { value: 'Asexual', label: 'Asexual' },
  { value: 'Demisexual', label: 'Demisexual' },
  { value: 'Pansexual', label: 'Pansexual' },
  { value: 'Queer', label: 'Queer' },
  { value: 'Questioning', label: 'Questioning' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];
function DatingSetupIdentity() {
  const convertedDayOptions = dayOptions.map((day) => ({ value: day, label: day }));
  const convertedYearOptions = yearOptions.map((year) => ({ value: year, label: year }));
  const [gender, setGender] = useState('male');
  const [selectGender, setSelectGender] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('disabled');
  const [selectedDay, setSelectedDay] = useState('disabled');
  const [selectedYear, setSelectedYear] = useState('disabled');
  const [selectedSexualOrentation, setSelectedSexualOrentation] = useState('disabled');
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
              <CustomSelect
                value={selectedMonth}
                onChange={(val) => setSelectedMonth(val)}
                options={[{ value: 'disabled', label: 'Month' }, ...monthOptions]}
                type="form"
              />
            </Col>
            <Col sm={12} md={4} className="mb-3">
              <CustomSelect
                value={selectedDay}
                onChange={(val) => setSelectedDay(val)}
                options={[{ value: 'disabled', label: 'Day' }, ...convertedDayOptions]}
                type="form"
              />
            </Col>
            <Col sm={12} md={4} className="mb-3">
              <CustomSelect
                value={selectedYear}
                onChange={(val) => setSelectedYear(val)}
                options={[{ value: 'disabled', label: 'Year' }, ...convertedYearOptions]}
                type="form"
              />
            </Col>
          </Row>
        </Col>
        <Col />
      </Row>
      <Row className="mt-3 mb-4">
        <Col sm={6} md={8}>
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
        <Col md={8}>
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
          <CustomSelect
            value={selectedSexualOrentation}
            onChange={(val) => setSelectedSexualOrentation(val)}
            options={[{ value: 'disabled', label: 'Selct one' }, ...sexualOrientationOptions]}
            type="form"
          />
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
            className="w-100"
          >
            Next Step
          </RoundButton>
        </Col>
      </Row>
    </DatingPageWrapper>
  );
}
export default DatingSetupIdentity;
