import React, { useState } from 'react';
import {
  Button,
  Col,
  Form,
  Row,
} from 'react-bootstrap';
import SliderComponent from '../../components/ui/SliderComponent';
import CustomSelect from '../../components/ui/CustomSelect';
import SliderThumbComponent from '../../components/ui/SliderThumbComponent';
import RangeSliderThumbComponent from '../../components/ui/RangeSliderThumbComponent';

const genderList = ['Men', 'Women', 'Both'];

function DatingAdditionalPreferences() {
  const [selectedGender, setSelectedGender] = useState('');
  const [distType, setDistType] = useState('mi');
  const [distance, setDistance] = useState(50);
  const [age, setAge] = useState([20, 26]);
  return (
    <>
      <h2 className="h4">
        I am looking for
      </h2>
      <Row className="mt-2">
        {genderList.map((gender: string) => (
          <Col xs={4}>
            <Button
              variant="form"
              size="lg"
              className="w-100 fs-6 p-2"
              name={gender}
              active={selectedGender === gender}
              onClick={(e: any) => setSelectedGender(e.target.name)}
            >
              {gender}
            </Button>
          </Col>
        ))}
      </Row>

      <Row className="mt-3 align-items-center">
        <Col md={6}>
          <h2 className="h4">Maximum Distance</h2>
        </Col>
        <Col md={6}>
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
      </Row>

      <Row>
        <Col className="d-flex mt-3 align-items-center">
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

      <Row className="mt-3 align-items-center">
        <Col md={6}>
          <h2 className="h4">Age Range</h2>
        </Col>
        <Col md={6} className="d-flex justify-content-md-end">
          <Button variant="primary" className="pe-none" size="lg">
            Between:&nbsp;
            {age[0]}
                        &nbsp;to&nbsp;
            {age[1]}
                        &nbsp;years
          </Button>
        </Col>
      </Row>

      <Row>
        <Col className="d-flex mt-3 align-items-center">
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
    </>
  );
}

export default DatingAdditionalPreferences;
