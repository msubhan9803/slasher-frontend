import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../components/ui/RoundButton';
import Switch from '../../components/ui/Switch';

const StyleBorderButton = styled(RoundButton)`
  border: 1px solid #3A3B46;
  &:hover, &:focus{
    border: 1px solid #3A3B46;
  }
`;
function NotificationSetting() {
  const [bgColor, setBgColor] = useState<boolean>(false);
  return (
    <div className="bg-dark mx-2 my-4 p-3 pb-0 rounded-3">
      <Row>
        <Col xs={6}>
          <StyleBorderButton onClick={() => setBgColor(!bgColor)} className={`w-100 rounded-pill shadow-none ${bgColor ? 'bg-primary border-primary' : 'bg-black text-white'}`}>
            {bgColor ? 'Follow' : 'Unfollow'}
          </StyleBorderButton>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <p className="fw-bold">Get updates for this place</p>
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
