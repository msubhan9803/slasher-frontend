import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import CustomSelect from '../../../../components/ui/CustomSelect';
import CustomToggleButton from '../../../../components/ui/CustomToggleButton';
import SwitchButtonGroup from '../../../../components/ui/SwitchButtonGroup';
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
  newToAreaOptions,
} from './additional-info-form-options';

function DatingAdditionalInfo() {
  const [newToArea, setNewToArea] = useState(newToAreaOptions[0].value);
  const [interests, setInterests] = useState<Set<string>>(new Set<string>());

  const interestsChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    const newSet = new Set<string>(interests);
    if (checked) { newSet.add(value); } else { newSet.delete(value); }
    setInterests(newSet);
  };

  return (
    <>
      <Row className="mx-0 mb-5">
        <h2 className="bg-secondary h5 m-0 mb-3 p-3 rounded-3">Appearance</h2>
        <Col xs={12}>
          <Row className="mb-4">
            <Col md={6}>
              <CustomSelect
                name="height"
                options={[]}
                label="Height"
              />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <CustomSelect
                name="bodyType"
                options={bodyTypeOptions}
                label="Body Type"
              />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <CustomSelect
                name="tattoos"
                options={tatoosOptions}
                label="Tattoos"
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mx-0 mb-5">
        <h2 className="bg-secondary h5 m-0 mb-3 p-3 rounded-3">Basic Info</h2>
        <Col xs={12}>
          <Row className="mb-4">
            <Col md={6}>
              <CustomSelect
                name="relationship"
                options={relationshipStatusOptions}
                label="Relationship Status"
              />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <CustomSelect
                name="educationLevel"
                options={educationLevelOptions}
                label="Education Level"
              />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <CustomSelect
                name="employment"
                options={employmentOptions}
                label="Employment"
              />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <CustomSelect
                name="drinking"
                options={drinkingOptions}
                label="Drinking"
              />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <CustomSelect
                name="smoking"
                options={smokingOptions}
                label="Smoking"
              />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <CustomSelect
                name="parentalStatus"
                options={parentalStatusOptions}
                label="Parental Status"
              />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <CustomSelect
                name="Religion"
                options={religionOptions}
                label="Religion"
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-3 d-none d-md-flex">
        <h2 className="bg-secondary h5 m-0 mb-3 p-3 rounded-3">Interest</h2>
        {interestsList.map((interest: string, index: number) => (
          <Col xs={4} xxl={2} key={interest}>
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
      </Row>
      <Row className="d-flex d-md-none">
        <h2 className="bg-secondary h5 m-0 mb-3 p-3 rounded-3">Interest</h2>
        {interestsList.map((interest: string, index: number) => (
          <Col xs={6} key={interest}>
            <Form.Check
              type="checkbox"
              id={`interest-${index}`}
              checked={interests.has(interest)}
              className="mb-2"
              label={interest}
              onChange={interestsChangeHandler}
            />
          </Col>
        ))}
      </Row>
      <Row>
        <h2 className="mt-5 mb-3">New to area</h2>
        <Col lg={2}>
          <SwitchButtonGroup
            value={newToArea}
            onChange={(val: string) => setNewToArea(val)}
            firstOption={newToAreaOptions[0]}
            secondOption={newToAreaOptions[1]}
          />
        </Col>
      </Row>
    </>
  );
}

export default DatingAdditionalInfo;
