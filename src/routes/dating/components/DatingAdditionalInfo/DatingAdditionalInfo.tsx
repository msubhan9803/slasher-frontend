import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import CustomSelectWithLabel from '../../../../components/ui/CustomSelectWithLabel';
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
        <Heading>Appearance</Heading>
        <Section>
          <Col xs={12}>
            <Row className="mb-4 align-items-center">
              <Col>
                <CustomSelectWithLabel
                  options={heightOptions}
                  label="Height"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelectWithLabel
                  options={bodyTypeOptions}
                  label="Body Type"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelectWithLabel
                  options={tatoosOptions}
                  label="Tattoos"
                />
              </Col>
            </Row>
          </Col>
        </Section>
      </Row>
      <Row className="mx-0 mb-4">
        <Heading>Basic Info</Heading>
        <Section>
          <Col xs={12}>
            <Row className="mb-4">
              <Col>
                <CustomSelectWithLabel
                  options={relationshipStatusOptions}
                  label="Relationship Status"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelectWithLabel
                  options={educationLevelOptions}
                  label="Education Level"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelectWithLabel
                  options={employmentOptions}
                  label="Employment"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelectWithLabel
                  options={drinkingOptions}
                  label="Drinking"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelectWithLabel
                  options={smokingOptions}
                  label="Smoking"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelectWithLabel
                  options={parentalStatusOptions}
                  label="Parental Status"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelectWithLabel
                  options={wantsChildrenOptions}
                  label="Wants (more) children"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <CustomSelectWithLabel
                  options={religionOptions}
                  label="Religion"
                />
              </Col>
            </Row>
          </Col>
        </Section>
      </Row>
      <Row className="mt-3 d-flex mb-4 mx-0">
        <Heading>Interests</Heading>
        <div className="mx-auto d-flex flex-wrap px-0 px-lg-4">
          {interestsList.map((interest: string, index: number) => (
            <CustomToggleButton
              key={interest}
              id={`interest-${index}`}
              label={interest}
              value={interest}
              checked={interests.has(interest)}
              type="checkbox"
              variant="form"
              className="my-1 w-100"
              onChange={interestsChangeHandler}
            />
          ))}
        </div>
      </Row>
    </>
  );
}

export default DatingAdditionalInfo;
