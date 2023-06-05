import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  ActionPerformed, PushNotifications, Token,
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import Cookies from 'js-cookie';
import { Device } from '@capacitor/device';
import { updateUserDeviceToken } from '../api/users';
import { urlForNotification } from '../utils/notification-url-utils';

function PushNotificationWrapper() {
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
        if (deviceToken !== Cookies.get('deviceToken')) {
          const deviceId = await Device.getId();
          updateUserDeviceToken(deviceId.uuid, deviceToken);
        }
        Cookies.set('deviceToken', deviceToken);
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
          const notificationData = JSON.parse(data);
          window.location.href = urlForNotification(notificationData);
          // navigate(urlForNotification(notificationData));
        },
      );
    }
  }, []);

  return (
    <Outlet />
  );
}

export default PushNotificationWrapper;
