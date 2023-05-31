import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  ActionPerformed, PushNotificationSchema, PushNotifications, Token,
} from '@capacitor/push-notifications';
import Cookies from 'js-cookie';
import { Device } from '@capacitor/device';
import { updateUserDeviceToken } from '../api/users';
import { urlForNotification } from '../utils/notification-url-utils';

function PushNotificationWrapper() {
  const navigate = useNavigate();
  const initPushNotifications = () => {
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

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      // Handle the received push notification
      // console.log('Push notification received:', JSON.parse(notification.data.data));
      const { data } = notification.data;
      const notificationData = JSON.parse(data);
      navigate(urlForNotification(notificationData));
    });

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: ActionPerformed) => {
        const { data } = notification.notification.data;
        const notificationData = JSON.parse(data);
        navigate(urlForNotification(notificationData));
      },
    );
  };
  useEffect(() => {
    initPushNotifications();
  }, [initPushNotifications]);

  return (
    <Outlet />
  );
}

export default PushNotificationWrapper;
