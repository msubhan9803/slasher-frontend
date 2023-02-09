import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import BorderButton from '../../components/ui/BorderButton';
import Switch from '../../components/ui/Switch';

function NotificationSetting() {
  const [bgColor, setBgColor] = useState<boolean>(false);
  return (
    <div className="bg-dark p-3 mb-5 rounded-3">
      <Row>
        <Col xs={6}>
          <BorderButton
            buttonClass="w-100 shadow-none"
            toggleBgColor={bgColor}
            handleClick={setBgColor}
            toggleButton
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <p className="fw-bold">Notifications settings</p>
          <div className="mb-2 lh-lg d-flex justify-content-between">
            <span>Push notifications</span>
            <Switch id="pushNotificationSwitch" className="ms-0 ms-md-3" />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default NotificationSetting;
