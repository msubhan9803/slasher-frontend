import React, { useState } from 'react';
import {
  Button,
  Col,
  Form,
  Row,
} from 'react-bootstrap';
import { Slider } from '@mui/material';
import styled from 'styled-components';
import UnauthenticatedSiteWrapper from '../../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
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

const CustomSelect = styled(Form)`
.form-select {
  width: 35%;
  margin-left: -4px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
`;

function DataingSetupAdditionalPreferences() {
  const [gender, setGender] = useState('');
  const [distance, setDistance] = useState(50);
  const [age, setAge] = useState([20, 26]);

  return (
    <UnauthenticatedSiteWrapper>
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <h1 className="h3">
            One this screen, you can set your filters.
            You will be able to change these later on the dating preferences screen.
          </h1>
        </Col>
        <Col md={8} className="mt-5">
          <Row className="px-2 align-items-center">
            <Col md={5} className="text-start">
              <h2 className="h4">Maximum Distance</h2>
            </Col>
            <Col md={7} className="mt-3 mt-md-0">
              <CustomSelect className="d-flex justify-content-md-end">
                <Button variant="primary" className="pe-none mw-25 w-25 rounded-3" style={{ zIndex: 1 }}>
                  {distance}
                  mi.
                </Button>
                <Form.Select className="shadow-none border-start-0 ps-4">
                  <option>mi (miles)</option>
                </Form.Select>
              </CustomSelect>
            </Col>
            <Col className="d-flex align-items-center px-1 mt-4">
              <p className="mb-0 me-4">01</p>
              <SliderComponent
                value={distance}
                onChange={(e: any) => setDistance(e.target.value)}
                aria-labelledby="input-slider"
                min={1}
                max={200}
              />
              <p className="mb-0 ms-4">200</p>
            </Col>
          </Row>
        </Col>
        <Col md={8} className="mt-5">
          <Row className="px-2 align-items-center">
            <Col md={5} className="text-start">
              <h2 className="h4">Age range </h2>
            </Col>
            <Col md={7} className="mt-3 mt-md-0 text-md-end">
              <Button variant="primary" className="pe-none" size="lg">
                Between:&nbsp;
                {age[0]}
                &nbsp;to&nbsp;
                {age[1]}
                &nbsp;years
              </Button>
            </Col>
            <Col className="d-flex align-items-center px-1 mt-4">
              <p className="mb-0 me-4">18</p>
              <SliderComponent
                value={age}
                min={18}
                max={55}
                onChange={(e: any) => setAge(e.target.value)}
                aria-labelledby="input-slider"
              />
              <p className="mb-0 ms-4">55+</p>
            </Col>
          </Row>
        </Col>
        <Col md={8} className="mt-5">
          <h2 className="h4">I am looking for</h2>
          <Row className="mt-4">
            <Col xs={4} md={3}>
              <Button
                variant="form"
                size="lg"
                className="w-100"
                name="men"
                active={gender === 'men'}
                onClick={(e: any) => setGender(e.target.name)}
              >
                Men
              </Button>
            </Col>
            <Col xs={4} md={3}>
              <Button
                variant="form"
                size="lg"
                className="w-100"
                name="women"
                active={gender === 'women'}
                onClick={(e: any) => setGender(e.target.name)}
              >
                Women
              </Button>
            </Col>
            <Col xs={4} md={3}>
              <Button
                variant="form"
                size="lg"
                className="w-100"
                name="both"
                active={gender === 'both'}
                onClick={(e: any) => setGender(e.target.name)}
              >
                Both
              </Button>
            </Col>
          </Row>
        </Col>
        <Col md={5} className="mt-5">
          <RoundButton className="w-100" type="submit">
            Next step
          </RoundButton>
        </Col>
      </Row>
    </UnauthenticatedSiteWrapper>
  );
}

export default DataingSetupAdditionalPreferences;
