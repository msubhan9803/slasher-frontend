/* eslint-disable max-lines */
/* eslint-disable max-len */
import React, {
  useEffect, useState, useCallback, useRef,
} from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import { getNotifications, markAllRead } from '../../api/notification';
import { Notification } from '../../types';
import NotificationTimestamp from './NotificationTimestamp';
import NotificationCard from './NotificationCard';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { resetUnreadNotificationCount, setUserInitialData } from '../../redux/slices/userSlice';
import NotificationsRightSideNav from './NotificationsRightSideNav';
import socketStore from '../../socketStore';
import {
  deletePageStateCache, getPageStateCache, hasPageStateCache, setPageStateCache,
} from '../../pageStateCache';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';

function Notifications() {
  const popoverOption = ['Settings'];
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { socket } = socketStore;

  const location = useLocation();
  const pageStateCache = getPageStateCache(location) ?? [];
  const [notificationData, setNotificationData] = useState<Notification[]>(
    hasPageStateCache(location)
      ? pageStateCache : [],
  );
  const userData = useAppSelector((state) => state.user);
  const lastLocationKeyRef = useRef(location.key);
  const fetchNotifcations = useCallback((forceReload = false) => {
    if (forceReload) { setNotificationData([]); }
    setLoadingPosts(true);
    const lastNotificationId = (notificationData.length > 0) ? notificationData[notificationData.length - 1]._id : undefined;
    getNotifications(forceReload ? undefined : lastNotificationId).then((res) => {
      const notification = res.data;
      setNotificationData((prev: any) => [
        ...(forceReload ? [] : prev),
        ...notification,
      ]);
      if (res.data.length === 0) { setNoMoreData(true); }
      if (hasPageStateCache(location)
        && notificationData.length >= pageStateCache.length + 10) {
        deletePageStateCache(location);
      }
    }).catch(
      (error) => {
        setNoMoreData(true);
        setErrorMessage(error.response?.data.message);
      },
    ).finally(
      () => {
        setRequestAdditionalPosts(false);
        setLoadingPosts(false);
        // Fixed edge case bug when `noMoreData` is already set to `true` when user has reached the
        // end of the page and clicks on the `notification-icon` in top navbar to reload the page
        // otherwise pagination doesn't work.
        if (forceReload && (noMoreData === true)) { setNoMoreData(false); }
      },
    );
  }, [location, noMoreData, notificationData, pageStateCache.length]);

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      if (hasPageStateCache(location)
        || notificationData.length >= pageStateCache.length
        || notificationData.length === 0
      ) {
        fetchNotifcations();
      }
    }
  }, [fetchNotifcations, loadingPosts, location, location.pathname, notificationData.length, pageStateCache.length, requestAdditionalPosts]);

  useEffect(() => {
    const isSameKey = lastLocationKeyRef.current === location.key;
    if (isSameKey) { return; }
    // Fetch notification when we click the `notfication-icon` in navbar
    fetchNotifcations(true);
    // Update lastLocation
    lastLocationKeyRef.current = location.key;
  }, [fetchNotifcations, location.key]);

  const persistScrollPosition = (id: string) => {
    const updatedNotification = notificationData.map((notify: any) => (notify._id === id ? ({ ...notify, isRead: 1 }) : notify));
    const notifyCount = userData.unreadNotificationCount > 0 ? userData.unreadNotificationCount - 1 : 0;
    dispatch(setUserInitialData(
      { ...userData, unreadNotificationCount: notifyCount },
    ));
    setPageStateCache(location, updatedNotification);
  };

  const handlePopover = () => {
    navigate('/app/account/notifications');
  };
  const renderNoMoreDataMessage = () => {
    if (loadingPosts) { return null; }
    return (
      <p className="text-center">
        {notificationData.length === 0
          ? 'No notifications.'
          : 'No more notifications'}
      </p>
    );
  };

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
              deletePageStateCache(location);
              dispatch(setUserInitialData(
                { ...userData, unreadNotificationCount: 0 },
              ));
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
          onPopoverClick={handlePopover}
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
    const notification: Notification = {
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
      socket?.emit('clearNewNotificationCount', {});
      dispatch(resetUnreadNotificationCount());
      socket.on('notificationReceived', onNotificationReceivedHandler);
      return () => {
        socket.off('notificationReceived', onNotificationReceivedHandler);
      };
    }
    return () => { };
  }, [onNotificationReceivedHandler, socket, dispatch]);

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
            threshold={3000}
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
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <NotificationsRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}
export default Notifications;
