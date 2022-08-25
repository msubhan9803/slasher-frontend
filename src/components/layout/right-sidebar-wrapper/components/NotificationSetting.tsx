import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../ui/RoundButton';
import Switch from '../../../ui/Switch';

const StyleBorderButton = styled(RoundButton)`
  border: 0.063rem solid #3A3B46;
  &:hover, &:focus{
    border: 0.063rem solid #3A3B46;
  }
`;
function NotificationSetting() {
  const [bgColor, setBgColor] = useState<boolean>(false);
  return (
    <div className="bg-dark m-2 p-3 rounded-3">
      <Row>
        <Col xs={6}>
          <StyleBorderButton onClick={() => setBgColor(!bgColor)} className={`w-100 rounded-pill shadow-none ${bgColor ? 'bg-primary border-primary' : 'bg-black'}`}>
            {bgColor ? 'Follow' : 'Unfollow'}
          </StyleBorderButton>
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
