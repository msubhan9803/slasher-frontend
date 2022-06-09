import React, { useState } from 'react';
import {
  Button,
  Col,
  Form,
  Row,
} from 'react-bootstrap';
import RoundButton from '../../components/ui/RoundButton';
import AuthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedSiteWrapper';
import SliderComponent from '../../components/ui/SliderComponent';
import CustomSelect from '../../components/ui/CustomSelect';
import SliderThumbComponent from '../../components/ui/SliderThumbComponent';
import RangeSliderThumbComponent from '../../components/ui/RangeSliderThumbComponent';

const availableGenderValues = ['Men', 'Women', 'Both'];

function DatingPreferences() {
  const [gender, setGender] = useState('');
  const [distType, setDistType] = useState('mi');
  const [distance, setDistance] = useState(50);
  const [age, setAge] = useState([20, 26]);

  return (
    <AuthenticatedSiteWrapper>
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <h1 className="h3">
            One this screen, you can set your filters.
            You will be able to change these later on the dating preferences screen.
          </h1>
        </Col>

        <Col md={8} className="mt-5">
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
        <Col md={8} className="mt-5">
          <Row className="px-2 align-items-center">
            <Col md={5} className="text-start">
              <h2 className="h4 mb-sm-0">Maximum Distance</h2>
            </Col>
            <Col md={7} className="mt-3 mt-md-0">
              <CustomSelect className="d-flex justify-content-md-end">
                <Button variant="primary" className="pe-none w-25 rounded-3" style={{ zIndex: 1 }}>
                  {distance}
                  {distType}
                  .
                </Button>
                <Form.Select
                  className="shadow-none border-start-0 ps-4"
                  value={distType}
                  onChange={(e) => setDistType(e.target.value)}
                >
                  <option value="mi">mi (miles)</option>
                  <option value="km">km (kilometers)</option>
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
                components={{ Thumb: SliderThumbComponent }}
              />
              <p className="mb-0 ms-4">200</p>
            </Col>
          </Row>
        </Col>
        <Col md={8} className="mt-5">
          <Row className="px-2 align-items-center">
            <Col md={5} className="text-start">
              <h2 className="h4 mb-sm-0">Age range </h2>
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
                components={{ Thumb: RangeSliderThumbComponent }}
              />
              <p className="mb-0 ms-4">55+</p>
            </Col>
          </Row>
        </Col>

        <Col md={8} className="mt-5">
          <Row className="px-2 align-items-center">
            <Col md={5} className="text-start">
              <h2 className="h4 mb-sm-0">Notifications</h2>
            </Col>
            <Col md={10}>
              <p>When you receive likes or messages, we will notify you by:</p>
            </Col>
            <Row>
              <Col md={6}>
                <span className="position">Push notifications</span>
                <label className="switch mx-2" htmlFor="togBtn">
                  <input type="checkbox" id="togBtn" />
                  <div className="slider round" />
                </label>
              </Col>

              <Col md={6}>
                <span className="position">Email notifications</span>
                <label className="switch mx-2" htmlFor="togBtn">
                  <input type="checkbox" id="togBtn" />
                  <div className="slider round" />
                </label>

              </Col>
            </Row>

          </Row>
        </Col>

        <Col md={5} className="mt-5">
          <RoundButton className="w-100" type="submit">
            Next step
          </RoundButton>
        </Col>
      </Row>
    </AuthenticatedSiteWrapper>
  );
}

export default DatingPreferences;
