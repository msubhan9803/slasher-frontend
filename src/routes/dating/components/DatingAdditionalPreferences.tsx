import React, { useState } from 'react';
import {
  Button,
  Col,
  Form,
  InputGroup,
  Row,
} from 'react-bootstrap';
import CustomSlider from '../../../components/ui/CustomSlider';
import SliderThumbComponent from '../../../components/ui/SliderThumbComponent';
import RangeSliderThumbComponent from '../../../components/ui/RangeSliderThumbComponent';

const genderList = ['Men', 'Women', 'Both'];

function DatingAdditionalPreferences() {
  const [selectedGender, setSelectedGender] = useState('');
  const [distType, setDistType] = useState('mi');
  const [distance, setDistance] = useState(50);
  const [age, setAge] = useState([20, 26]);
  return (
    <>
      <h2 className="h4 mb-0">
        I am looking for
      </h2>
      <Row className="my-4 pt-2">
        {genderList.map((gender: string) => (
          <Col xs={4}>
            <Button
              variant="form"
              size="lg"
              className="w-100 fs-6 p-2"
              name={gender}
              active={selectedGender === gender}
              onClick={(e) => setSelectedGender((e.target as HTMLButtonElement).name)}
            >
              {gender}
            </Button>
          </Col>
        ))}
      </Row>

      <Row className="mb-4 mt-5 align-items-center">
        <Col lg={6}>
          <h2 className="h4 mb-4 mb-lg-0">Maximum Distance</h2>
        </Col>
        <Col xs={12} lg={6} className="d-flex">
          <InputGroup className="input-group-sm">
            <InputGroup.Text className="bg-secondary fs-5 border-0 pe-3 text-primary">
              {distance}
            </InputGroup.Text>
            <Form.Select
              aria-label="Distance unit"
              className="no-shadow rounded-3"
              value={distType}
              onChange={(e) => setDistType((e.target as HTMLSelectElement).value)}
            >
              <option value="mi">{distance === 1 ? 'mile' : 'miles'}</option>
              <option value="km">{distance === 1 ? 'kilometer' : 'kilometers'}</option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      <Row>
        <Col className="d-flex mt-3 align-items-center">
          <p className="mb-0 me-4">01</p>
          <CustomSlider
            value={distance}
            onChange={(e) => setDistance((e.target as any).value)}
            aria-labelledby="input-slider"
            min={1}
            max={200}
            components={{ Thumb: SliderThumbComponent }}
          />
          <p className="mb-0 ms-4">200</p>
        </Col>
      </Row>

      <Row className="mb-4 mt-5 align-items-center">
        <Col lg={6}>
          <h2 className="h4 mb-4 mb-lg-0">Age Range</h2>
        </Col>
        <Col lg={6} className="d-flex justify-content-lg-end">
          <p className="mb-0 fs-5 text-primary">{`Between ${age[0]} to ${age[1]} years`}</p>
        </Col>
      </Row>

      <Row>
        <Col className="d-flex mt-3 align-items-center">
          <p className="mb-0 me-4">18</p>
          <CustomSlider
            value={age}
            min={18}
            max={55}
            onChange={(e) => setAge((e.target as any).value)}
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
