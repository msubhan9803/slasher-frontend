/* eslint-disable max-lines */
/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { getNotifications, markAllRead } from '../../api/notification';
import { Notification } from '../../types';
import NotificationTimestamp from './NotificationTimestamp';
import NotificationCard from './NotificationCard';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import NotificationsRIghtSideNav from './NotificationsRIghtSideNav';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';

function Notifications() {
  const popoverOption = ['Settings'];
  const [notificationData, setNotificationData] = useState<Notification[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
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
  }, [requestAdditionalPosts, loadingPosts, notificationData]);
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

  const groupNotificationsByDateRange = (notifications: Notification[]) => {
    const groupedNotifications: {
      today: Notification[],
      thisWeek: Notification[],
      thisMonth: Notification[],
      older: Notification[]
    } = {
      today: [],
      thisWeek: [],
      thisMonth: [],
      older: [],
    };

    notifications.forEach((notification) => {
      const createdAtDateTime = DateTime.fromISO(notification.createdAt);
      if (DateTime.now().diff(createdAtDateTime).as('hour') <= 24) {
        groupedNotifications.today.push(notification);
      } else if (DateTime.now().diff(createdAtDateTime).as('week') <= 1) {
        groupedNotifications.thisWeek.push(notification);
      } else if (DateTime.now().diff(createdAtDateTime).as('month') <= 1) {
        groupedNotifications.thisMonth.push(notification);
      } else {
        groupedNotifications.older.push(notification);
      }
    });

    return groupedNotifications;
  };

  const renderNotificationsWithLabels = (notifications: Notification[]) => {
    let markButton = true;
    const groupedNotifications = groupNotificationsByDateRange(notifications);

    const elementsToRender: any = [];

    Object.entries(groupedNotifications).forEach(([notificationGroupName, notificationsForGroup]) => {
      if (notificationsForGroup.length > 0) {
        elementsToRender.push(<NotificationTimestamp
          key={notificationGroupName}
          isoDateString={notificationsForGroup[0].createdAt}
          show={markButton}
          onMarkAllReadClick={onMarkAllReadClick}
          popoverOption={popoverOption}
          handleLikesOption={handleLikesOption}
        />);
        markButton = false;
        notificationsForGroup.forEach((notification, index) => {
          const lastCard = notificationsForGroup.length - 1 === index;
          elementsToRender.push(<NotificationCard notification={notification} lastCard={lastCard} />);
        });
      }
    });

    return elementsToRender;
  };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
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
                  {renderNotificationsWithLabels(notificationData)}
                </div>
              )}
          </InfiniteScroll>
          {loadingPosts && <LoadingIndicator />}
          {noMoreData && renderNoMoreDataMessage()}
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <NotificationsRIghtSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}
export default Notifications;
