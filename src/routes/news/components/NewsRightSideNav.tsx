import React, { useState } from 'react';
import {
  Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import Switch from '../../../components/ui/Switch';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import RoundButton from '../../../components/ui/RoundButton';

const CustomButton = styled(RoundButton)`
  border: 0.063rem solid #3A3B46;
`;
function NewsRightSideNav() {
  const [bgColor, setBgColor] = useState(false);

  return (
    <>
      <div className="bg-dark m-2 mb-4 p-3 rounded-3">
        <Row>
          <Col xs={6}>
            <CustomButton
              onClick={() => setBgColor(!bgColor)}
              className={`w-100  rounded-pill shadow-none ${bgColor ? 'bg-primary' : 'bg-black'}`}
            >
              {bgColor ? 'Follow' : 'Unfollow'}
            </CustomButton>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col>
            <p className="fw-bold">Get updates for this movie</p>
            <div className="mb-2 lh-lg d-flex justify-content-between">
              <span>Push notifications</span>
              <Switch id="pushNotificationSwitch" className="ms-0 ms-md-3" />
            </div>
          </Col>
        </Row>
      </div>
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default NewsRightSideNav;
