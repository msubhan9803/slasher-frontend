import React, { useEffect, useState } from 'react';
import {
  Col, Row,
} from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Switch from '../../../components/ui/Switch';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import RoundButton from '../../../components/ui/RoundButton';
import {
  disableRssFeedProviderNotification, enableRssFeedProviderNotification, followRssFeedProvider,
  getRssFeedProviderFollowUnfollow, unfollowRssFeedProvider,
} from '../../../api/rss-feed-providers';
import { useAppSelector } from '../../../redux/hooks';
import { RssFeedProviderFollowNotificationsEnabled } from '../../../types';

function NewsRightSideNav() {
  const [following, setFollowing] = useState<boolean>();
  const [notificationToggle, setNotificationToggle] = useState<boolean>();
  const { partnerId } = useParams();
  const userData = useAppSelector((state) => state.user);

  const callGetFollowUnfollowDetail = () => {
    if (userData?.user) {
      getRssFeedProviderFollowUnfollow(partnerId!, userData.user.id).then((res: any) => {
        if (res.data) {
          setFollowing(true);
          if (res.data.notification === RssFeedProviderFollowNotificationsEnabled.NotEnabled) {
            setNotificationToggle(false);
          } else if (res.data.notification === RssFeedProviderFollowNotificationsEnabled.Enabled) {
            setNotificationToggle(true);
          }
        }
      }).catch((error) => {
        if (error.response.status === 404) {
          setFollowing(false);
          setNotificationToggle(false);
        }
      });
    }
  };

  useEffect(() => {
    if (userData && userData.user) {
      callGetFollowUnfollowDetail();
    }
  }, [partnerId, userData]);

  const followUnfollowClick = () => {
    if (!following) {
      followRssFeedProvider(partnerId!, userData.user.id).then(() => {
        callGetFollowUnfollowDetail();
      });
    } else {
      unfollowRssFeedProvider(partnerId!, userData.user.id).then(() => {
        callGetFollowUnfollowDetail();
      });
    }
  };

  const onOffNotificationClick = () => {
    if (!notificationToggle) {
      enableRssFeedProviderNotification(partnerId!, userData.user.id).then(() => {
        callGetFollowUnfollowDetail();
      });
    } else {
      disableRssFeedProviderNotification(partnerId!, userData.user.id).then(() => {
        callGetFollowUnfollowDetail();
      });
    }
  };

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
