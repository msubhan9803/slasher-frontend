/* eslint-disable max-lines */
import React, { useState } from 'react';
import {
  Button, Col, Container, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import UnauthenticatedSiteWrapper from '../../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
import RoundButton from '../../../components/ui/RoundButton';

const ToggleButton = styled.div`
  float: left;
  background: #1F1F1F;
  border: #3A3B46;
  border-radius: 3px;

  input {
    position: absolute;
    opacity: 0;
  }
  input+label {
    padding: 5px 22px;
    float: left;
    color: #fff;
    cursor: pointer;
  }
  input:checked+.primary {
    background: var(--bs-primary);
    border-radius: 75px;
  }
`;

const interestsList = [
  'Art',
  'Board games',
  'Books',
  'Cooking',
  'Movies',
  'Music',
  'Men',
  'Outdoors',
  'Sports',
  'Video games',
  'Writing',
  'Other',
];
const relationshipStatusOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Separated', value: 'separated' },
  { label: 'Divorced', value: 'divorced' },
  { label: 'Open relationship', value: 'openrelationship' },
  { label: 'Widowed', value: 'widowed' },
];
const bodyTypeOptions = [
  { label: 'Thin', value: 'thin' },
  { label: 'Average', value: 'average' },
  { label: 'Fit / Muscular', value: 'fit/muscular' },
  { label: 'Few extra lbs', value: 'fewExtraLbs' },
  { label: 'Large', value: 'large' },
];
const tatoosOptions = [
  { label: 'Some', value: 'some' },
  { label: 'A lot', value: 'lot' },
  { label: 'None', value: 'none' },
];
const ethnicityOptions = [
  { label: 'African American / Black', value: 'African American / Black' },
  { label: 'Asian', value: 'Asian' },
  { label: 'Caucasian / White', value: 'Caucasian / White' },
  { label: 'Hispanic / Latin', value: 'Hispanic / Latin' },
  { label: 'Indian', value: 'Indian' },
  { label: 'Middle Eastern', value: 'Middle Eastern' },
  { label: 'Multiracial', value: 'Multiracial' },
  { label: 'Native American', value: 'Native American' },
  { label: 'Pacific Islander', value: 'Pacific Islander' },
  { label: 'Other', value: 'Other' },
];
const parentalStatusOptions = [
  { label: 'Does not have children & wants children', value: 'parentalStatus1' },
  { label: 'Does not have children & doesn’t want children', value: 'parentalStatus2' },
  { label: 'Has children & wants more', value: 'parentalStatus3' },
  { label: 'Has children & doesn’t want more', value: 'parentalStatus4' },
];
const religionOptions = [
  { label: 'Anglican', value: 'Anglican' },
  { label: 'Agnostic', value: 'Agnostic' },
  { label: 'Atheist', value: 'Atheist' },
  { label: 'Baptist', value: 'Baptist' },
  { label: 'Buddhist', value: 'Buddhist' },
  { label: 'Catholic', value: 'Catholic' },
  { label: 'Christian', value: 'Christian' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Jewish', value: 'Jewish' },
  { label: 'Lutheran', value: 'Lutheran' },
  { label: 'Methodist', value: 'Methodist' },
  { label: 'Muslim', value: 'Muslim' },
  { label: 'New Age', value: 'New Age' },
  { label: 'Pagan', value: 'Pagan' },
];
const educationLevelOptions = [
  { label: 'Primary / Grammar', value: 'primary/grammar' },
  { label: 'High school', value: 'highSchool' },
  { label: 'Associate', value: 'associate' },
  { label: 'Bachelor', value: 'bachelor' },
  { label: 'Master’s / Graduate', value: 'master’s/graduate' },
  { label: 'Doctorate', value: 'doctorate' },
];
const employmentOptions = [
  { label: 'Not employed', value: 'notEmployed' },
  { label: 'Part-time', value: 'fart-time' },
  { label: 'Full-time', value: 'full-time' },
  { label: 'Self employed', value: 'selfEmployed' },
];
const petOptions = [
  { label: 'Cat(s)', value: 'cat(s)' },
  { label: 'Dog(s)', value: 'dog(s)' },
  { label: 'Other', value: 'other' },
  { label: 'None', value: 'none' },
];
const drinkingOptions = [
  { label: 'No', value: 'no' },
  { label: 'Rarely', value: 'rarely' },
  { label: 'Socially', value: 'socially' },
  { label: 'Often', value: 'often' },
];
const smokingOptions = [
  { label: 'Non-smoker', value: 'non-smoker' },
  { label: 'Smoker', value: 'smoker' },
];

function DatingSetupAdditionalIdentifier() {
  const [interest, setInterest] = useState('');
  return (
    <UnauthenticatedSiteWrapper>
      <Row>
        <Col sm={12} md={3}>
          <p className="m-1">Relationship Status</p>
          <Form.Select aria-label="Relationship Status selection" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {relationshipStatusOptions.map((relation) => (
              <option key={relation.value} value={relation.value}>{relation.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col sm={12} md={3}>
          <p className="m-1">Body Type</p>
          <Form.Select aria-label="Body Type selection" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {bodyTypeOptions.map((body) => (
              <option key={body.value} value={body.value}>{body.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col sm={12} md={3}>
          <p className="m-1">Tattoos</p>
          <Form.Select aria-label="Tattoos selection" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {tatoosOptions.map((tatoo) => (
              <option key={tatoo.value} value={tatoo.value}>{tatoo.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col sm={12} md={3}>
          <p className="m-1">Ethnicity</p>
          <Form.Select aria-label="Ethnicity selection" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {ethnicityOptions.map((ethnicity) => (
              <option key={ethnicity.value} value={ethnicity.value}>{ethnicity.label}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col sm={12} md={6}>
          <p className="m-1">Parental Status</p>
          <Form.Select aria-label="Parental Status selection" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {parentalStatusOptions.map((parental) => (
              <option key={parental.value} value={parental.value}>{parental.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col sm={12} md={6}>
          <p className="m-1">Religion</p>
          <Form.Select aria-label="Religion selection" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {religionOptions.map((religion) => (
              <option key={religion.value} value={religion.value}>{religion.label}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col sm={12} md={6}>
          <p className="m-1">Education Level</p>
          <Form.Select aria-label="Education Level selection" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {educationLevelOptions.map((education) => (
              <option key={education.value} value={education.value}>{education.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col sm={12} md={6}>
          <p className="m-1">Employment</p>
          <Form.Select aria-label="Employment selection" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {employmentOptions.map((employment) => (
              <option key={employment.value} value={employment.value}>{employment.label}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col sm={12} md={4}>
          <p className="m-1">Pets</p>
          <Form.Select aria-label="Pets selection" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {petOptions.map((pet) => (
              <option key={pet.value} value={pet.value}>{pet.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col sm={12} md={4}>
          <p className="m-1">Drinking</p>
          <Form.Select aria-label="Drinking selection" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {drinkingOptions.map((drink) => (
              <option key={drink.value} value={drink.value}>{drink.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col sm={12} md={4}>
          <p className="m-1">Smoking</p>
          <Form.Select aria-label="Smoking selection" defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {smokingOptions.map((smok) => (
              <option key={smok.value} value={smok.value}>{smok.label}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <h4 className="mt-5">Interests</h4>
      <Row className="mt-3 ">
        {interestsList.map((interests: string) => (
          <Col xs={4} md={2} key={interests} className="d-md-block d-none">
            <Button
              variant="form"
              size="lg"
              className="w-100 my-1 fs-6"
              name={interests}
              active={interests === interest}
              onClick={(e: any) => setInterest(e.target.name)}
            >
              {interests}
            </Button>
          </Col>
        ))}
      </Row>
      <Row>
        {interestsList.map((check: any, index: any) => (
          <Col xs={6} className="d-block d-sm-none" key={check}>
            <Form.Check
              type="checkbox"
              id={`${check} - ${index}`}
              className="mb-2"
              label={check}
            />
          </Col>
        ))}
      </Row>

      <h4 className="mt-5">New to area</h4>
      <Row>
        <Col lg={2}>
          <ToggleButton className=" rounded-pill ">
            <input id="yes" name="state-toggle" className="primary" type="radio" defaultChecked />
            <label htmlFor="yes" className="primary">Yes</label>

            <input id="no" name="state-toggle" className="primary" type="radio" />
            <label htmlFor="no" className="primary">No</label>
          </ToggleButton>
        </Col>
      </Row>

      <Row className="mt-4 justify-content-center">
        <Col md={4}>
          <RoundButton className="w-100" type="submit">
            Next step
          </RoundButton>
        </Col>
      </Row>
    </UnauthenticatedSiteWrapper>
  );
}
export default DatingSetupAdditionalIdentifier;
