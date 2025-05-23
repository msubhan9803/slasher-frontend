import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  ActionPerformed, PushNotifications, Token,
} from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { getDeviceToken, getSessionToken, setDeviceToken } from '../utils/session-utils';
import { updateUserDeviceToken } from '../api/users';
import { urlForNotification } from '../utils/notification-url-utils';
import { markRead } from '../api/notification';
import { Notification, NotificationType } from '../types';
import useGoogleAnalytics from '../hooks/useGoogleAnalytics';

function CapacitorAppListeners() {
  const navigate = useNavigate();
  useGoogleAnalytics();

  useEffect(() => {
    CapacitorApp.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      const { pathname, search, hash } = new URL(event.url);
      const routePath = pathname + search + hash;
      if (routePath) {
        navigate(routePath);
      }
    });
  }, [navigate]);

  const checkAndSetAppVerionPreferance = async () => {
    const appVersion = (await Preferences.get({ key: 'app-version' })).value;
    const result = await AppUpdate.getAppUpdateInfo();
    const { currentVersion } = result;
    // let updateRequired = false;
    // const currentParts = currentVersion.split('.').map(Number);
    // const availableParts = availableVersion.split('.').map(Number);
    // for (let i = 0; i < currentParts.length; i += 1) {
    //   if (currentParts[i] < availableParts[i]) {
    //     updateRequired = true;
    //   }
    // }
    // if (updateRequired) {
    //   await AppUpdate.openAppStore();
    // }
    if (result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
      await AppUpdate.openAppStore();
    }
    if (currentVersion !== appVersion) {
      await Preferences.set({ key: 'app-version', value: currentVersion });
      window.location.reload();
    }
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      checkAndSetAppVerionPreferance();
    }
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      PushNotifications.requestPermissions().then((result) => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener('registration', async (token: Token) => {
        // Send the token to your server for further processing, if needed
        const deviceToken = token.value;
        const fetchedDeviceToken = await getDeviceToken();
        const fetchedSessionToken = await getSessionToken();
        if (!fetchedDeviceToken
          || (fetchedSessionToken && fetchedDeviceToken && deviceToken !== fetchedDeviceToken)) {
          const deviceId = await Device.getId();
          updateUserDeviceToken(deviceId.identifier, deviceToken);
          await setDeviceToken(deviceToken);
        }
      });

      // PushNotifications.addListener('pushNotificationReceived',
      // (notification: PushNotificationSchema) => {
      //   // Handle the received push notification
      //   const { data } = notification.data;
      //   const notificationData = JSON.parse(data);
      // });

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        async (notification: ActionPerformed) => {
          const { data } = notification.notification.data;
          const notificationData = JSON.parse(data) as Notification;
          // eslint-disable-next-line max-len
          const isMessageNotification = notificationData.notifyType === NotificationType.FriendMessageNotification;
          if (!isMessageNotification) {
            await markRead(notificationData._id);
          }
          const url = urlForNotification(notificationData);
          window.location.href = url;
          // navigate(urlForNotification(notificationData));
        },
      );
    }
  }, []);

  return (
    <Outlet />
  );
}

export default CapacitorAppListeners;
