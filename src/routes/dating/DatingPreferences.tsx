import React, { useState } from 'react';
import {
  Button,
  Col,
  Form,
  Row,
} from 'react-bootstrap';
import styled from 'styled-components';
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

  const Paragraph = styled.p`
  color:#CCCCCC;
  `;

  return (
    <AuthenticatedSiteWrapper>
      <Row>
        <Col md={8}>
          <Row>
            <Col md={12}>
              <h1 className="h3">
                Dating Preferences
              </h1>
            </Col>
          </Row>

          <div className="ms-3 mt-4">
            <Row>
              <Col md={12}>
                <h2 className="h4">I am looking for</h2>
              </Col>
            </Row>

            <Row className="mt-2">
              {availableGenderValues.map((gen: string) => (
                <Col md={4} xs={4}>
                  <Button
                    variant="form"
                    size="lg"
                    className="w-100 p-2 fs-6"
                    name={gen}
                    active={gender === gen}
                    onClick={(e: any) => setGender(e.target.name)}
                  >
                    {gen}
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
                    className="shadow-none border-start-0 ps-4 pe-1"
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
              <Col md={12} className="d-flex mt-3">
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
              <Col md={6}>
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
              <Col md={12} className="d-flex mt-3">
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

            <Row className="mt-4">
              <Col md={12}>
                <h2 className="h4">Notifications</h2>
              </Col>
            </Row>

            <Row>
              <Col md={10}>
                <Paragraph className="mt-2">When you receive likes or messages, we will notify you by:</Paragraph>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col md={6}>
                <div className="lh-lg d-flex">
                  <span>Push notifications</span>
                  <label className="switch ms-3" htmlFor="pushNotificationsSwitch">
                    <input type="checkbox" id="pushNotificationsSwitch" />
                    <div className="slider round ms-5 ms-md-0" />
                  </label>
                </div>
              </Col>
              <Col md={6}>
                <div className="lh-lg d-flex mt-sm-0 mt-3">
                  <span>Email notifications</span>
                  <div>
                    <label className="switch ms-3 " htmlFor="emailNotificationsSwitch">
                      <input type="checkbox" id="emailNotificationsSwitch" />
                      <div className="slider round ms-5 ms-md-0" />
                    </label>
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="d-flex justify-content-center">
              <Col md={6} className="mt-4">
                <RoundButton className="w-100" type="submit">
                  Save Changes
                </RoundButton>
              </Col>
            </Row>
          </div>

        </Col>
      </Row>
    </AuthenticatedSiteWrapper>
  );
}

export default DatingPreferences;
