import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import CustomSelect from '../../../../components/ui/CustomSelect';
import CustomToggleButton from '../../../../components/ui/CustomToggleButton';
import {
  bodyTypeOptions,
  educationLevelOptions,
  relationshipStatusOptions,
  tatoosOptions,
  employmentOptions,
  drinkingOptions,
  smokingOptions,
  parentalStatusOptions,
  religionOptions,
  interestsList,
  wantsChildrenOptions,
  heightOptions,
} from './additional-info-form-options';
import { Heading, Section } from '../styledUtils';

const HEADING = 'bg-secondary h2 m-0 mb-3 p-3 rounded-3';
const SECTION_INNER = 'row gx-3 mx-auto';

function DatingAdditionalInfo() {
  const [interests, setInterests] = useState<Set<string>>(new Set<string>());

  const interestsChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    const newSet = new Set<string>(interests);
    if (checked) { newSet.add(value); } else { newSet.delete(value); }
    setInterests(newSet);
  };

  return (
    <>
      <Row className="mx-0 mb-4">
        <Heading className={HEADING}>Appearance</Heading>
        <Section className={SECTION_INNER}>
          <Col xs={12}>
            <Row className="mb-4 align-items-center">
              <Col>
                <CustomSelect
                  name="height"
                  options={heightOptions}
                  label="Height"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelect
                  name="bodyType"
                  options={bodyTypeOptions}
                  label="Body Type"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelect
                  name="tattoos"
                  options={tatoosOptions}
                  label="Tattoos"
                />
              </Col>
            </Row>
          </Col>
        </Section>
      </Row>
      <Row className="mx-0 mb-4">
        <Heading className={HEADING}>Basic Info</Heading>
        <Section className={SECTION_INNER}>
          <Col xs={12}>
            <Row className="mb-4">
              <Col>
                <CustomSelect
                  name="relationship"
                  options={relationshipStatusOptions}
                  label="Relationship Status"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelect
                  name="educationLevel"
                  options={educationLevelOptions}
                  label="Education Level"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelect
                  name="employment"
                  options={employmentOptions}
                  label="Employment"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelect
                  name="drinking"
                  options={drinkingOptions}
                  label="Drinking"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelect
                  name="smoking"
                  options={smokingOptions}
                  label="Smoking"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelect
                  name="parentalStatus"
                  options={parentalStatusOptions}
                  label="Parental Status"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelect
                  name="parentalInterest"
                  options={wantsChildrenOptions}
                  label="Wants (more) children"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelect
                  name="Religion"
                  options={religionOptions}
                  label="Religion"
                />
              </Col>
            </Row>
          </Col>
        </Section>
      </Row>
      <Row className="mt-3 d-none d-md-flex mb-4 mx-0">
        <Heading className={HEADING}>Interests</Heading>
        <Section className={SECTION_INNER}>
          {interestsList.map((interest: string, index: number) => (
            <Col md={4} lg={3} xxl={2} key={interest}>
              <CustomToggleButton
                id={`interest-${index}`}
                label={interest}
                value={interest}
                checked={interests.has(interest)}
                type="checkbox"
                variant="form"
                className="btn-lg fs-6 my-1 w-100"
                onChange={interestsChangeHandler}
              />
            </Col>
          ))}
        </Section>
      </Row>
      <Row className="d-flex d-md-none mb-4 mx-0">
        <Heading className={HEADING}>Interests</Heading>
        <Section className={SECTION_INNER}>
          {interestsList.map((interest: string, index: number) => (
            <Col xs={6} key={interest}>
              <Form.Check
                type="checkbox"
                id={`interest-${index}`}
                checked={interests.has(interest)}
                className="mb-2"
                label={interest}
                value={interest}
                onChange={interestsChangeHandler}
              />
            </Col>
          ))}
        </Section>
      </Row>
    </>
  );
}

export default DatingAdditionalInfo;
