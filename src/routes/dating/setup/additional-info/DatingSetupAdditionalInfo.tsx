import React, { useState } from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import AuthenticatedSiteWrapper from '../../../../components/layout/main-site-wrapper/authenticated/AuthenticatedSiteWrapper';
import CustomToggleButton from '../../../../components/ui/CustomToggleButton';
import RoundButton from '../../../../components/ui/RoundButton';
import SwitchButtonGroup from '../../../../components/ui/SwitchButtonGroup';
import {
  parentalStatusOptions,
  drinkingOptions,
  employmentOptions,
  ethnicityOptions,
  newToAreaOptions,
  petOptions,
  religionOptions,
  smokingOptions,
  educationLevelOptions,
  relationshipStatusOptions,
  tatoosOptions,
  bodyTypeOptions,
  interestsList,
} from './additional-info-form-options';
import DatingInfoSelect from './DatingInfoSelect';

function DatingSetupAdditionalInfo() {
  const [interests, setInterests] = useState<Set<string>>(new Set<string>());
  const [newToArea, setNewToArea] = useState(newToAreaOptions[0].value);

  const interestsChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    const newSet = new Set<string>(interests);
    if (checked) { newSet.add(value); } else { newSet.delete(value); }
    setInterests(newSet);
  };

  return (
    <AuthenticatedSiteWrapper>
      <Form>
        <Row>
          <Col sm={12} md={3}>
            <DatingInfoSelect
              name="relationship"
              options={relationshipStatusOptions}
              label="Relationship Status"
            />
          </Col>
          <Col sm={12} md={3}>
            <DatingInfoSelect
              name="bodyType"
              options={bodyTypeOptions}
              label="Body Type"
            />
          </Col>
          <Col sm={12} md={3}>
            <DatingInfoSelect
              name="tattoos"
              options={tatoosOptions}
              label="Tattoos"
            />
          </Col>
          <Col sm={12} md={3}>
            <DatingInfoSelect
              name="ethnicity"
              options={ethnicityOptions}
              label="Ethnicity"
            />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col sm={12} md={6}>
            <DatingInfoSelect
              name="parentalStatus"
              options={parentalStatusOptions}
              label="Parental Status"
            />
          </Col>
          <Col sm={12} md={6}>
            <DatingInfoSelect
              name="Religion"
              options={religionOptions}
              label="Religion"
            />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col sm={12} md={6}>
            <DatingInfoSelect
              name="educationLevel"
              options={educationLevelOptions}
              label="Education Level"
            />
          </Col>
          <Col sm={12} md={6}>
            <DatingInfoSelect
              name="employment"
              options={employmentOptions}
              label="Employment"
            />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col sm={12} md={4}>
            <DatingInfoSelect
              name="pets"
              options={petOptions}
              label="Pets"
            />
          </Col>
          <Col sm={12} md={4}>
            <DatingInfoSelect
              name="drinking"
              options={drinkingOptions}
              label="Drinking"
            />
          </Col>
          <Col sm={12} md={4}>
            <DatingInfoSelect
              name="smoking"
              options={smokingOptions}
              label="Smoking"
            />
          </Col>
        </Row>
        <h4 className="mt-5">Interests</h4>
        <Row className="mt-3 d-none d-md-flex">
          {interestsList.map((interest: string, index: number) => (
            <Col xs={4} md={2} key={interest}>
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

        <Row>
          {interestsList.map((interest: string, index: number) => (
            <Col xs={6} className="d-block d-md-none" key={interest}>
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

        <h4 className="mt-5">New to area</h4>
        <Row>
          <Col lg={2}>
            <SwitchButtonGroup
              value={newToArea}
              onChange={(val) => setNewToArea(val)}
              firstOption={newToAreaOptions[0]}
              secondOption={newToAreaOptions[1]}
            />
          </Col>
        </Row>

        <Row className="mt-4 justify-content-center">
          <Col md={4}>
            <RoundButton
              className="w-100"
              type="submit"
            >
              Next step
            </RoundButton>
          </Col>
        </Row>
      </Form>
    </AuthenticatedSiteWrapper>
  );
}
export default DatingSetupAdditionalInfo;
