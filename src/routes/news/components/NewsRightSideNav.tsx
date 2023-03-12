// @ts-nocheck
import React from 'react';
import {
  Col, Row,
} from 'react-bootstrap';
import Switch from '../../../components/ui/Switch';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import RoundButton from '../../../components/ui/RoundButton';

interface Props {
  onOffNotificationClick: () => void;
  followUnfollowClick: () => void;
  following: boolean;
  notificationToggle: boolean
}

function NewsRightSideNav({
  onOffNotificationClick, followUnfollowClick, following, notificationToggle,
}: Props) {
  return (
    <>
      <div className="bg-dark  mb-4 mt-0 p-3 rounded-3">
        <Row>
          <Col xs={6}>
            <RoundButton
              variant={following ? 'black' : 'primary'}
              onClick={followUnfollowClick}
              className="w-100 fs-3 rounded-pill"
            >
              {following ? 'Unfollow' : 'Follow'}
            </RoundButton>
          </Col>
        </Row>
        {following
            && (
              <Row className="mt-3">
                <Col>
                  <p className="fs-3 fw-bold">Get updates for this news partner</p>
                  <div className="fs-3 mb-2 lh-lg d-flex justify-content-between">
                    <span>Push notifications</span>
                    <Switch id="pushNotificationSwitch" className="ms-0 ms-md-3" onSwitchToggle={onOffNotificationClick} isChecked={notificationToggle} />
                  </div>
                </Col>
              </Row>
            )}
      </div>
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default NewsRightSideNav;
