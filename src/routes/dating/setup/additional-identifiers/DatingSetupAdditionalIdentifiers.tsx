/* eslint-disable max-lines */
import React, { useState } from 'react';
import {
  Button, Col, Form, Row,
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

function DatingSetupAdditionalIdentifiers() {
  const [interest, setInterest] = useState('');
  const [newToArea, setNewToArea] = useState(newToAreaOptions[0].value);

  return (
    <UnauthenticatedSiteWrapper>
      <Form>
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
        {/* mobile view for interest list */}
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
            <RoundButton className="w-100" type="submit">
              Next step
            </RoundButton>
          </Col>
        </Row>
      </Form>
    </UnauthenticatedSiteWrapper>
  );
}
export default DatingSetupAdditionalIdentifiers;
