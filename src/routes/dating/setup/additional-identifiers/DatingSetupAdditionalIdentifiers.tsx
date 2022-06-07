import React, { useState } from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import UnauthenticatedSiteWrapper from '../../../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
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
} from './additional-identifiers-form-options';
import DatingIdentifierSelect from './DatingIdentifierSelect';

function DatingSetupAdditionalIdentifiers() {
  const [newToArea, setNewToArea] = useState(newToAreaOptions[0].value);

  return (
    <UnauthenticatedSiteWrapper>
      <Form>
        <Row>
          <Col sm={12} md={3}>
            <DatingIdentifierSelect
              name="relationship"
              options={relationshipStatusOptions}
              label="Relationship Status"
            />
          </Col>
          <Col sm={12} md={3}>
            <DatingIdentifierSelect
              name="bodyType"
              options={bodyTypeOptions}
              label="Body Type"
            />
          </Col>
          <Col sm={12} md={3}>
            <DatingIdentifierSelect
              name="tattoos"
              options={tatoosOptions}
              label="Tattoos"
            />
          </Col>
          <Col sm={12} md={3}>
            <DatingIdentifierSelect
              name="ethnicity"
              options={ethnicityOptions}
              label="Ethnicity"
            />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col sm={12} md={6}>
            <DatingIdentifierSelect
              name="parentalStatus"
              options={parentalStatusOptions}
              label="Parental Status"
            />
          </Col>
          <Col sm={12} md={6}>
            <DatingIdentifierSelect
              name="Religion"
              options={religionOptions}
              label="Religion"
            />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col sm={12} md={6}>
            <DatingIdentifierSelect
              name="educationLevel"
              options={educationLevelOptions}
              label="Education Level"
            />
          </Col>
          <Col sm={12} md={6}>
            <DatingIdentifierSelect
              name="employment"
              options={employmentOptions}
              label="Employment"
            />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col sm={12} md={4}>
            <DatingIdentifierSelect
              name="pets"
              options={petOptions}
              label="Pets"
            />
          </Col>
          <Col sm={12} md={4}>
            <DatingIdentifierSelect
              name="drinking"
              options={drinkingOptions}
              label="Drinking"
            />
          </Col>
          <Col sm={12} md={4}>
            <DatingIdentifierSelect
              name="smoking"
              options={smokingOptions}
              label="Smoking"
            />
          </Col>
        </Row>
        <h4 className="mt-5">Interests</h4>
        <Row className="mt-3">
          {interestsList.map((interests: string) => (
            <Col xs={4} md={2} key={interests} className="d-md-block d-none">
              <input type="checkbox" className="btn-check" id={interests} />
              <label className="btn btn-form btn-lg fs-6 my-1 w-100" htmlFor={interests}>
                {interests}
              </label>
            </Col>
          ))}
        </Row>
        <Row>
          {interestsList.map((check: any, index: any) => (
            <Col xs={6} className="d-block d-md-none" key={check}>
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
    </UnauthenticatedSiteWrapper>
  );
}
export default DatingSetupAdditionalIdentifiers;
