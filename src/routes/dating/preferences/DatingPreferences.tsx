import React from 'react';
import {
  Col,
  Row,
} from 'react-bootstrap';
import RoundButton from '../../../components/ui/RoundButton';
import DatingAdditionalPreferences from '../components/DatingAdditionalPreferences';
import Switch from '../../../components/ui/Switch';
import DatingPageWrapper from '../components/DatingPageWrapper';

function DatingPreferences() {
  return (
    <DatingPageWrapper>
      <Row>
        <Col xs={12} md={8}>
          <h1 className="h3 d-none d-md-block">
            Dating Preferences
          </h1>

          <div className="ms-0 ms-md-3 mt-md-4 mt-2">
            <DatingAdditionalPreferences />
            <Row className="mt-4">
              <Col>
                <h2 className="h4">Notifications</h2>
              </Col>
            </Row>

            <Row>
              <Col>
                <p className="mt-2 text-light">When you receive likes or messages, we will notify you by:</p>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col md={6}>
                <div className="lh-lg d-flex justify-content-between justify-content-md-start">
                  <span>Push notifications</span>
                  <Switch id="pushNotificationsSwitch" className="ms-0 ms-md-3" />
                </div>
              </Col>
              <Col md={6}>
                <div className="lh-lg d-flex mt-md-0 mt-3 justify-content-between justify-content-md-start ">
                  <span>Email notifications</span>
                  <div>
                    <Switch id="emailNotificationsSwitch" className="ms-0 ms-md-3" />
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
    </DatingPageWrapper>
  );
}

export default DatingPreferences;
