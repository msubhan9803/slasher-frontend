import React, { useState } from 'react';
import {
  Button,
  Col,
  Form,
  InputGroup,
  Row,
} from 'react-bootstrap';
import { Slider, SliderThumb } from '@mui/material';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';

const SliderComponent = styled(Slider)`
.css-14pt78w-MuiSlider-rail   {
  color: #3A3B46;
  border-radius: 0;
  height: 8px;
}
.css-1gv0vcd-MuiSlider-track {
  color: var(--bs-primary);
  border-radius: 0;
  height: 8px;
}
.css-eg0mwd-MuiSlider-thumb {
  color: var(--bs-primary);
  width: 40px;
  height: 40px;
}
`;

const DistanceInputGroup = styled(InputGroup)`
  .input-group-text {
    margin-right: -.5rem;
    z-index: 100;
    width: 33%;
  }
`;

function DistanceThumbComponent(props: any) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <FontAwesomeIcon icon={solid('chevron-right')} size="lg" color="white " />
    </SliderThumb>
  );
}

function AgeThumbComponent(props: any) {
  const { children, ...other } = props;
  const extraClassName = other['data-index'] === 0 ? 'first-thumb' : 'second-thumb';
  if (extraClassName === 'first-thumb') {
    return (
      <SliderThumb {...other}>
        {children}
        <FontAwesomeIcon icon={solid('chevron-left')} size="lg" color="white " />
      </SliderThumb>
    );
  }
  return (
    <SliderThumb {...other}>
      {children}
      <FontAwesomeIcon icon={solid('chevron-right')} size="lg" color="white " />
    </SliderThumb>
  );
}

const availableGenderValues = ['Men', 'Women', 'Both'];

function DataingSetupAdditionalPreferences() {
  const [gender, setGender] = useState('');
  const [distType, setDistType] = useState('mi');
  const [distance, setDistance] = useState(50);
  const [age, setAge] = useState([20, 26]);

  return (
    <AuthenticatedPageWrapper>
      <Row className="justify-content-center">
        <Col md={10} className="text-center">
          <h1 className="h3">
            One this screen, you can set your filters.
            You will be able to change these later on the dating preferences screen.
          </h1>
        </Col>

        <Col md={10} className="mt-5">
          <h2 className="h4">I am looking for</h2>
          <Row className="mt-4">
            {availableGenderValues.map((gen: string) => (
              <Col xs={4} md={3} key={gen}>
                <Button
                  variant="form"
                  size="lg"
                  className="w-100"
                  name={gen}
                  active={gender === gen}
                  onClick={(e: any) => setGender(e.target.name)}
                >
                  {gen}
                </Button>
              </Col>
            ))}
          </Row>
        </Col>
        <Col md={10} className="mt-5">
          <Row className="px-2 align-items-center">
            <Col sm={4} lg={6} xl={7} className="text-start">
              <h2 className="h4 mb-sm-0">Maximum Distance</h2>
            </Col>
            <Col sm={8} lg={6} xl={5} className="mt-3 mt-sm-0">
              <DistanceInputGroup>
                <InputGroup.Text className="rounded-3 bg-primary d-inline-block text-center fs-5">
                  {distance}
                </InputGroup.Text>
                <Form.Select
                  aria-label="Distance unit"
                  className="shadow-none border-start-0 ps-4 w-50"
                  value={distType}
                  onChange={(e) => setDistType(e.target.value)}
                >
                  <option value="mi">mi (miles)</option>
                  <option value="km">km (kilometers)</option>
                </Form.Select>
              </DistanceInputGroup>
            </Col>
            <Col className="d-flex align-items-center px-1 mt-4">
              <p className="mb-0 me-4">01</p>
              <SliderComponent
                value={distance}
                onChange={(e: any) => setDistance(e.target.value)}
                aria-labelledby="input-slider"
                min={1}
                max={200}
                components={{ Thumb: DistanceThumbComponent }}
              />
              <p className="mb-0 ms-4">200</p>
            </Col>
          </Row>
        </Col>
        <Col md={10} className="mt-5">
          <Row className="px-2 align-items-center">
            <Col md={5} className="text-start">
              <h2 className="h4 mb-sm-0">Age range </h2>
            </Col>
            <Col md={7} className="mt-3 mt-md-0 text-md-end">
              <span className="d-inline-block bg-primary p-3 rounded-3 fs-5">
                Between:&nbsp;
                {age[0]}
                &nbsp;to&nbsp;
                {age[1]}
                &nbsp;years
              </span>
            </Col>
            <Col className="d-flex align-items-center px-1 mt-4">
              <p className="mb-0 me-4">18</p>
              <SliderComponent
                value={age}
                min={18}
                max={55}
                onChange={(e: any) => setAge(e.target.value)}
                aria-labelledby="input-slider"
                components={{ Thumb: AgeThumbComponent }}
              />
              <p className="mb-0 ms-4">55+</p>
            </Col>
          </Row>
        </Col>
        <Col md={5} className="mt-5">
          <RoundButton className="w-100" type="submit">
            Next step
          </RoundButton>
        </Col>
      </Row>
    </AuthenticatedPageWrapper>
  );
}

export default DataingSetupAdditionalPreferences;
