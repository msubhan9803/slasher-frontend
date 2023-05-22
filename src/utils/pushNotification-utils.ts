import { ActionPerformed, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';

export const initPushNotifications = () => {
  PushNotifications.requestPermissions().then((result) => {
    if (result.receive === 'granted') {
      PushNotifications.register();
    }
  });

  PushNotifications.addListener('registration', (token: Token) => {
    // Send the token to your server for further processing, if needed
    console.log('Push notification token:', token.value);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    // Handle the received push notification
    console.log('Push notification receivedgggg:', notification);
  });

  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    async (notification: ActionPerformed) => {
      const data = notification.notification.data;
      console.log('Action performed: ' + JSON.stringify(notification.notification));
      if (data.userName) {
        // notification tap routing will be here
      }
    }
  );
};
