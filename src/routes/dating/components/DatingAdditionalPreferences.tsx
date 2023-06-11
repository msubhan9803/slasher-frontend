import React, { useState } from 'react';
import {
  Button,
  Col,
  InputGroup,
  Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import CustomSlider from '../../../components/ui/CustomSlider';
import SliderThumbComponent from '../../../components/ui/SliderThumbComponent';
import RangeSliderThumbComponent from '../../../components/ui/RangeSliderThumbComponent';
import Switch from '../../../components/ui/Switch';
import CustomSelect from '../../../components/filter-sort/CustomSelect';

const CustomButton = styled(Button)`
  &.active{
    color: black !important;
    font-weight: bold !important;
  }
`;
const genderList = ['Men', 'Women', 'Both'];
function DatingAdditionalPreferences() {
  const [selectedGender, setSelectedGender] = useState('Women');
  const [distType, setDistType] = useState('mi');
  const [distance, setDistance] = useState(50);
  const [age, setAge] = useState([20, 26]);
  const distanceOptions = [
    { value: 'ml', label: distance === 1 ? 'Mile' : 'Miles' },
    { value: 'km', label: distance === 1 ? 'kilometer' : 'Kilometers' },
  ];
  return (
    <>
      <h1 className="h2 mb-5 d-none d-md-block">Dating Preferences</h1>
      <h2 className="mt-3">I am looking for</h2>
      <Row className="mb-4 pt-2">
        {genderList.map((gender: string) => (
          <Col key={gender} xs={4}>
            <CustomButton
              variant="form"
              size="lg"
              className="w-100 fs-3 fw-normal p-2"
              name={gender}
              active={selectedGender === gender}
              onClick={(e: any) => setSelectedGender((e.target as HTMLButtonElement).name)}
            >
              {gender}
            </CustomButton>
          </Col>
        ))}
      </Row>

      <Row className="mb-3 mt-4 align-items-center">
        <Row className=" mb-4 align-items-center justify-content-between pe-0">
          <Col md={6}>
            <h3 className="h2 mb-4 mb-lg-0">Maximum Distance</h3>
          </Col>
          <Col xs={4} md="auto" className="pe-0">
            <InputGroup className="input-group-sm">
              <InputGroup.Text className="bg-transparent fw-bold border-0 pe-3 text-primary">
                {distance}
              </InputGroup.Text>
              <CustomSelect
                value={distType}
                onChange={setDistType}
                options={distanceOptions}
                type="form"
              />
            </InputGroup>
          </Col>
        </Row>

        <div>
          <div className="d-flex mt-3 align-items-center mb-2">
            <p className="mb-0 me-4 d-none d-md-block">01</p>
            <CustomSlider
              value={distance}
              onChange={(e) => setDistance((e.target as any).value)}
              aria-labelledby="input-slider"
              min={1}
              max={200}
              components={{ Thumb: SliderThumbComponent }}
            />
            <p className="mb-0 ms-4 d-none d-md-block">200</p>
          </div>
          <div className="d-flex d-md-none justify-content-between">
            <p className="mb-0 me-4">01</p>
            <p className="mb-0 ms-4">200</p>
          </div>
        </div>

        <div className="mb-4 mt-4 d-md-flex d-block align-items-center justify-content-between">
          <div>
            <h2 className="mb-4 mb-lg-0">Age range</h2>
          </div>
          <div className="d-flex justify-content-lg-end">
            <p className="mb-0 fs-5 text-primary">
              {`${age[0]} to ${age[1]}`}
              {age[1] === 55 && '+'}
            </p>
          </div>
        </div>

        <div>
          <div className="d-flex my-2 align-items-center">
            <p className="mb-0 me-4 d-none d-md-block">18</p>
            <CustomSlider
              value={age}
              min={18}
              max={55}
              onChange={(e) => setAge((e.target as any).value)}
              aria-labelledby="input-slider"
              components={{ Thumb: RangeSliderThumbComponent }}
            />
            <p className="mb-0 ms-4 d-none d-md-block">55+</p>
          </div>
          <div className="d-flex d-md-none justify-content-between">
            <p className="mb-0 me-4">18</p>
            <p className="mb-0 ms-4">55+</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="h2">Notifications</h4>
          <p className="fs-4 text-light mt-2">When you receive likes or messages, we will notify you by:</p>
          <Row className="lh-lg d-flex justify-content-between justify-content-md-start">
            <Col md={5} lg={7} xl={5} className="d-flex justify-content-between">
              <p className="fs-3">Push notifications</p>
              <Switch id="pushNotificationsSwitch" className="ms-0 me-md-5" />
            </Col>
          </Row>
        </div>
      </Row>
    </>
  );
}

export default DatingAdditionalPreferences;
