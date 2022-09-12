import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomPopover from '../../components/ui/CustomPopover';
import RoundButton from '../../components/ui/RoundButton';

interface NotificationProps {
  id: number;
  userProfile: string;
  name: string;
  action: string;
  response?: string;
  timeStamp: string;
}
const UserCircleImageContainer = styled.div`
  background-color: #171717;
  img {
    height: 50px;
    width: 50px;
  }
`;
const StyledBorder = styled.div`
  border-bottom: 1px solid #3A3B46;
  svg {
    width: 8px;
  }
  &:last-of-type {
    border-bottom: none !important;
    padding-bottom: 0 !important
  }
`;
const StyleBorderButton = styled(RoundButton)`
  border: 1px solid #3A3B46;
  &:hover {
    border: 1px solid #3A3B46;
  }
`;
const todayNotifications: NotificationProps[] = [
  {
    id: 1, userProfile: 'https://i.pravatar.cc/300?img=19', name: 'Eliza Williams', action: 'commented on your post', timeStamp: 'Just now',
  },
  {
    id: 2, userProfile: 'https://i.pravatar.cc/300?img=20', name: 'Benjamin', action: 'reacted to your comment:', response: 'Lorem Ipsum is not simply', timeStamp: '2 hours ago',
  },
  {
    id: 3, userProfile: 'https://i.pravatar.cc/300?img=21', name: 'William Joe', action: 'shared your post', timeStamp: '18 hours ago',
  },
];
const thisWeekNotifications: NotificationProps[] = [
  {
    id: 1, userProfile: 'https://i.pravatar.cc/300?img=19', name: 'Eliza Williams', action: 'commented on your post', timeStamp: 'Just now',
  },
  {
    id: 2, userProfile: 'https://i.pravatar.cc/300?img=20', name: 'Benjamin', action: 'reacted to your comment:', response: 'Lorem Ipsum is not simply', timeStamp: '2 hours ago',
  },
];
const thisMonthNotifications: NotificationProps[] = [
  {
    id: 1, userProfile: 'https://i.pravatar.cc/300?img=19', name: 'Eliza Williams', action: 'commented on your post', timeStamp: 'Just now',
  },
  {
    id: 2, userProfile: 'https://i.pravatar.cc/300?img=20', name: 'Benjamin', action: 'reacted to your comment:', response: 'Lorem Ipsum is not simply', timeStamp: '2 hours ago',
  },
];
function Notifications() {
  const popoverOption = ['Settings'];

  const handleLikesOption = (likeValue: string) => {
    <Link to={`/navigations/${likeValue}`} />;
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="notification">
      <div className="bg-dark bg-mobile-transparent p-lg-4 rounded-3">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="h3 fw-semibold mb-0">Today</h1>
          <div className="d-flex justify-content-between align-items-center">
            <StyleBorderButton className="text-white bg-black px-4">Mark all read</StyleBorderButton>
            <span className="d-lg-none">
              <CustomPopover popoverOptions={popoverOption} onPopoverClick={handleLikesOption} />
            </span>
          </div>
        </div>
        <div>
          {todayNotifications.map((likesDetail) => (
            <StyledBorder key={likesDetail.id} className="d-flex justify-content-between py-3">
              <Button className="px-0 shadow-none text-white text-start d-flex align-items-center bg-transparent border-0">
                <UserCircleImageContainer className="text-white d-flex justify-content-center align-items-center rounded-circle me-3">
                  <Image src={likesDetail.userProfile} alt="user profile" className="rounded-circle" />
                </UserCircleImageContainer>
                <div>
                  <div className="d-flex align-items-center">
                    <h3 className="h4 mb-0 fw-bold me-1">
                      {likesDetail.name}
                      <span className="fs-4 mb-0 fw-normal">
                        {likesDetail.action}
                        {likesDetail.response && (
                          <span className="ms-1 fs-4 mb-0 fw-normal">
                            &#34;
                            {likesDetail.response}
                            &#34;
                          </span>
                        )}
                        .&nbsp;&nbsp;
                        <FontAwesomeIcon icon={solid('circle')} className="text-primary" />
                      </span>
                    </h3>
                  </div>
                  <h4 className="h5 mb-0 text-light">{likesDetail.timeStamp}</h4>
                </div>
              </Button>
            </StyledBorder>
          ))}
        </div>
        <div>
          <h1 className="h3 fw-semibold mt-5 mb-3">This week</h1>
          {thisWeekNotifications.map((likesDetail) => (
            <StyledBorder key={likesDetail.id} className="d-flex justify-content-between py-3">
              <Button className="px-0 shadow-none text-white text-start d-flex align-items-center bg-transparent border-0">
                <UserCircleImageContainer className="text-white d-flex justify-content-center align-items-center rounded-circle me-3">
                  <Image src={likesDetail.userProfile} alt="user profile" className="rounded-circle" />
                </UserCircleImageContainer>
                <div>
                  <div className="d-flex align-items-center">
                    <h3 className="h4 mb-0 fw-bold me-1">
                      {likesDetail.name}
                      <span className="fs-4 mb-0 fw-normal">
                        {likesDetail.action}
                        {likesDetail.response && (
                          <span className="ms-1 fs-4 mb-0 fw-normal">
                            &#34;
                            {likesDetail.response}
                            &#34;
                          </span>
                        )}
                        .&nbsp;&nbsp;
                        <FontAwesomeIcon icon={solid('circle')} className="text-primary" />
                      </span>
                    </h3>
                  </div>
                  <h4 className="h5 mb-0 text-light">{likesDetail.timeStamp}</h4>
                </div>
              </Button>
            </StyledBorder>
          ))}
        </div>
        <div>
          <h1 className="h3 fw-semibold mt-5 mb-3">This month</h1>
          {thisMonthNotifications.map((likesDetail) => (
            <StyledBorder key={likesDetail.id} className="d-flex justify-content-between py-3">
              <Button className="px-0 shadow-none text-white text-start d-flex align-items-center bg-transparent border-0">
                <UserCircleImageContainer className="text-white d-flex justify-content-center align-items-center rounded-circle me-3">
                  <Image src={likesDetail.userProfile} alt="user profile" className="rounded-circle" />
                </UserCircleImageContainer>
                <div>
                  <div className="d-flex align-items-center">
                    <h3 className="h4 mb-0 fw-bold me-1">
                      {likesDetail.name}
                      <span className="fs-4 mb-0 fw-normal">
                        {likesDetail.action}
                        {likesDetail.response && (
                          <span className="ms-1 fs-4 mb-0 fw-normal">
                            &#34;
                            {likesDetail.response}
                            &#34;
                          </span>
                        )}
                        .&nbsp;&nbsp;
                        <FontAwesomeIcon icon={solid('circle')} className="text-primary" />
                      </span>
                    </h3>
                  </div>
                  <h4 className="h5 mb-0 text-light">{likesDetail.timeStamp}</h4>
                </div>
              </Button>
            </StyledBorder>
          ))}
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default Notifications;
