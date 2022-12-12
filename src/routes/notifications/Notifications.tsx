import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Image } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomPopover from '../../components/ui/CustomPopover';
import RoundButton from '../../components/ui/RoundButton';
import { getNotifications, markAllRead } from '../../api/notification';
import { NotificationList, NotificationReadStatus } from '../../types';
import NotificationTimestamp from './NotificationTimestamp';

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
function Notifications() {
  const popoverOption = ['Settings'];
  const [notificationData, setNotificationData] = useState<NotificationList[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  let lastTimeStampMessage = '';
  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      setLoadingPosts(true);
      getNotifications(
        /* eslint no-underscore-dangle: 0 */
        notificationData.length > 1 ? notificationData[notificationData.length - 1]._id : undefined,
      ).then((res) => {
        const notification = res.data;
        setNotificationData((prev: any) => [
          ...prev,
          ...notification,
        ]);
        if (res.data.length === 0) { setNoMoreData(true); }
      }).catch(
        (error) => {
          setNoMoreData(true);
          setErrorMessage(error.response?.data.message);
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
  const onMarkAllReadClick = () => {
    setNoMoreData(false);
    markAllRead()
      .then((res) => {
        if (res.data.success) {
          getNotifications(undefined)
            .then((result) => {
              const notification = result.data;
              setNotificationData([
                ...notification,
              ]);
            }).catch(
              (error) => {
                setNoMoreData(true);
                setErrorMessage(error.response?.data.message);
              },
            );
        }
      });
  };

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
          {notificationData && notificationData.length > 0
            && (
              <div>
                {notificationData.map((today, index) => {
                  lastTimeStampMessage = index > 0 ? notificationData[index - 1]?.createdAt : '';
                  return (
                    <React.Fragment key={today._id}>
                      {(!lastTimeStampMessage
                        || DateTime.fromISO(lastTimeStampMessage).toISODate()
                        !== DateTime.fromISO(today?.createdAt).toISODate())
                        && (
                          <div
                            className={`d-flex align-items-center justify-content-between ${index > 0 ? 'mt-4' : ''}`}
                          >
                            <NotificationTimestamp date={today?.createdAt} />
                            {index === 0
                              && (
                                <div className="d-flex justify-content-between align-items-center">
                                  <StyleBorderButton className="text-white bg-black px-4" onClick={() => onMarkAllReadClick()}>Mark all read</StyleBorderButton>
                                  <span className="d-lg-none">
                                    <CustomPopover
                                      popoverOptions={popoverOption}
                                      onPopoverClick={handleLikesOption}
                                    />
                                  </span>
                                </div>
                              )}
                          </div>
                        )}
                      <StyledBorder key={today._id} className="d-flex justify-content-between py-3">
                        <Link to="/notifications/placeholder-link-target" className="text-decoration-none px-0 shadow-none text-white text-start d-flex align-items-center bg-transparent border-0">
                          {today.senderId && (
                            <UserCircleImageContainer className="text-white d-flex justify-content-center align-items-center rounded-circle me-3">
                              <Image src={today.senderId?.profilePic} alt="" className="rounded-circle" />
                            </UserCircleImageContainer>
                          )}
                          <div>
                            <div className="d-flex align-items-center">
                              <h3 className="h4 mb-0 fw-bold me-1">
                                {today.senderId?.userName}
                                <span className="fs-4 mb-0 fw-normal">
                                  &nbsp;
                                  {today.notificationMsg}
                                  .&nbsp;&nbsp;
                                  {today.isRead === NotificationReadStatus.Unread && (
                                    <FontAwesomeIcon icon={solid('circle')} className="text-primary" />
                                  )}
                                </span>
                              </h3>
                            </div>
                            <h4 className="h5 mb-0 text-light">{DateTime.fromISO(today.createdAt).toFormat('MM/dd/yyyy t')}</h4>
                          </div>
                        </Link>
                      </StyledBorder>
                      {/* </> */}
                      {/* )} */}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
        </InfiniteScroll>
        {loadingPosts && renderLoadingIndicator()}
        {noMoreData && renderNoMoreDataMessage()}
      </div>
    </AuthenticatedPageWrapper>
  );
}
export default Notifications;
