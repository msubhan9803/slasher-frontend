import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Image } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomPopover from '../../components/ui/CustomPopover';
import RoundButton from '../../components/ui/RoundButton';
import { getNotifications } from '../../api/notification';

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
const todayNotifications: NotificationProps[] = [];
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
  const [notificationData, setNotificationData] = useState<any>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      setLoadingPosts(true);
      getNotifications(
        notificationData.length > 1 ? notificationData[notificationData.length - 1]._id : undefined,
      ).then((res) => {
        const notification = res.data.map((data: any) => {
          return {
            /* eslint no-underscore-dangle: 0 */
            _id: data._id,
            id: data._id,
            postDate: data.createdAt,
            content: data.message,
            images: data.images,
            userName: data.userId.userName,
            profileImage: data.userId.profilePic,
            userId: data.userId._id,
          };
        });
        setNotificationData((prev: any) => [
          ...prev,
          ...notification,
        ]);
        if (res.data.length === 0) { setNoMoreData(true); }
      }).catch(
        (error) => {
          setNoMoreData(true);
          setErrorMessage(error.response.data.message);
        },
      ).finally(
        () => { setRequestAdditionalPosts(false); setLoadingPosts(false); },
      );
    }
  }, [requestAdditionalPosts, loadingPosts]);

  const handleLikesOption = (likeValue: string) => {
    <Link to={`/navigations/${likeValue}`} />;
  };
  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        notificationData.length === 0
          ? 'No notifications.'
          : 'No more notifications'
      }
    </p>
  );
  const renderLoadingIndicator = () => (
    <p className="text-center">Loading...</p>
  );
  return (
    <AuthenticatedPageWrapper rightSidebarType="notification">
      <div className="bg-dark bg-mobile-transparent p-lg-4 rounded-3">
        {errorMessage && errorMessage.length > 0 && (
          <div className="mt-3 text-start">
            {errorMessage}
          </div>
        )}
        <InfiniteScroll
          pageStart={0}
          initialLoad
          loadMore={() => { setRequestAdditionalPosts(true); }}
          hasMore={!noMoreData}
        >
          <div
            className={`d-flex justify-content-end align-items-center ${todayNotifications && todayNotifications.length > 0 && 'justify-content-between'}`}
          >
            {todayNotifications && todayNotifications.length > 0 && <h1 className="h3 fw-semibold mb-0">Today</h1>}
            <div className="d-flex justify-content-between align-items-center">
              <StyleBorderButton className="text-white bg-black px-4">Mark all read</StyleBorderButton>
              <span className="d-lg-none">
                <CustomPopover popoverOptions={popoverOption} onPopoverClick={handleLikesOption} />
              </span>
            </div>
          </div>
          <div>
            {notificationData && notificationData.length > 0 && notificationData.map((today: any) => (
              <StyledBorder key={today._id} className="d-flex justify-content-between py-3">
                <Button className="px-0 shadow-none text-white text-start d-flex align-items-center bg-transparent border-0">
                  <UserCircleImageContainer className="text-white d-flex justify-content-center align-items-center rounded-circle me-3">
                    <Image src={today.user?.profilePic} alt="" className="rounded-circle" />
                  </UserCircleImageContainer>
                  <div>
                    <div className="d-flex align-items-center">
                      <h3 className="h4 mb-0 fw-bold me-1">
                        {today.userId?.userName}
                        <span className="fs-4 mb-0 fw-normal">
                          &nbsp;
                          {today.notificationMsg}
                          .&nbsp;&nbsp;
                          {today.isRead === 0 && (
                            <FontAwesomeIcon icon={solid('circle')} className="text-primary" />
                          )}
                        </span>
                      </h3>
                    </div>
                    <h4 className="h5 mb-0 text-light">{today.timeStamp}</h4>
                  </div>
                </Button>
              </StyledBorder>
            ))}
          </div>
          {/* {thisWeekNotifications && thisWeekNotifications.length > 0
            && <div>
              <h1 className="h3 fw-semibold mt-5 mb-3">This week</h1>
              {notificationData.map((likesDetail: any) => (
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
          }
          {thisMonthNotifications && thisMonthNotifications.length > 0
            && <div>
              <h1 className="h3 fw-semibold mt-5 mb-3">This month</h1>
              {notificationData.map((likesDetail: any) => (
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
          } */}
        </InfiniteScroll>
        {loadingPosts && renderLoadingIndicator()}
        {noMoreData && renderNoMoreDataMessage()}
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default Notifications;
