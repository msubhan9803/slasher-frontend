/* eslint-disable max-lines */
/* eslint-disable max-len */
import React, {
  useEffect, useState, useContext, useCallback,
} from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Link, useLocation } from 'react-router-dom';
import { DateTime } from 'luxon';
import { getNotifications, markAllRead } from '../../api/notification';
import { Notification } from '../../types';
import NotificationTimestamp from './NotificationTimestamp';
import NotificationCard from './NotificationCard';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import NotificationsRIghtSideNav from './NotificationsRIghtSideNav';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setScrollPosition } from '../../redux/slices/scrollPositionSlice';
import { SocketContext } from '../../context/socket';

function Notifications() {
  const popoverOption = ['Settings'];
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const dispatch = useAppDispatch();
  const socket = useContext(SocketContext);
  const location = useLocation();
  const [notificationData, setNotificationData] = useState<Notification[]>(
    scrollPosition.pathname === location.pathname
      ? scrollPosition?.data : [],
  );
  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      if (scrollPosition === null
        || scrollPosition?.position === 0
        || notificationData.length >= scrollPosition?.data?.length
        || notificationData.length === 0
      ) {
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
          const positionData = {
            pathname: '',
            position: 0,
            data: [],
            positionElementId: '',
          };
          dispatch(setScrollPosition(positionData));
        }).catch(
          (error) => {
            setNoMoreData(true);
            setErrorMessage(error.response?.data.message);
          },
        ).finally(
          () => { setRequestAdditionalPosts(false); setLoadingPosts(false); },
        );
      }
    }
  }, [requestAdditionalPosts, loadingPosts, scrollPosition, notificationData, dispatch]);

  const persistScrollPosition = (id: string) => {
    const positionData = {
      pathname: location.pathname,
      position: window.pageYOffset,
      data: notificationData,
      positionElementId: id,
    };
    dispatch(setScrollPosition(positionData));
  };

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
          elementsToRender.push(
            <NotificationCard
              notification={notification}
              lastCard={lastCard}
              onSelect={persistScrollPosition}
            />,
          );
        });
      }
    });

    return elementsToRender;
  };

  const onNotificationReceivedHandler = useCallback((payload: any) => {
    const notification : Notification = {
      _id: payload.notification._id,
      createdAt: payload.notification.createdAt,
      isRead: payload.notification.isRead,
      notificationMsg: payload.notification.notificationMsg,
      senderId: payload.notification.senderId,
      feedPostId: payload.notification.feedPostId,
      feedCommentId: payload.notification.feedCommentId,
      feedReplyId: payload.notification.feedReplyId,
      userId: payload.notification.userId,
      rssFeedProviderId: payload.notification.rssFeedProviderId,
      rssFeedId: payload.notification.rssFeedId,
      notifyType: payload.notification.notifyType,
    };

    setNotificationData((prev: any) => [
      notification,
      ...prev,
    ]);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('notificationReceived', onNotificationReceivedHandler);
      return () => {
        socket.off('notificationReceived', onNotificationReceivedHandler);
      };
    }
    return () => { };
  }, [onNotificationReceivedHandler, socket]);

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
      <RightSidebarWrapper>
        <NotificationsRIghtSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}
export default Notifications;
