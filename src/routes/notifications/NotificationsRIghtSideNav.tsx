import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import AdvertisementBox from '../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import FriendRequests from '../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import RecentMessages from '../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import RoundButton from '../../components/ui/RoundButton';

const StyleBorderButton = styled(RoundButton)`
  border: 0.063rem solid #3A3B46;
  &:hover {
    border: 0.063rem solid #3A3B46;
  }
`;
function NotificationsRIghtSideNav() {
  return (
    <>
      <Link to="/notifications">
        <StyleBorderButton className="w-100 mb-4 text-white bg-black">Settings</StyleBorderButton>
      </Link>
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default NotificationsRIghtSideNav;
