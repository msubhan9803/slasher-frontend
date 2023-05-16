import { PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';

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
    console.log('Push notification received:', notification);
  });

//   PushNotifications.addListener('pushNotificationActionPerformed',
// (notification: PushNotificationSchema) => {
//     // Handle the user action on the received push notification
//     console.log('Push notification action performed:', notification);
//   });
};
