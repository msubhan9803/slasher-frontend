/* eslint-disable class-methods-use-this */
import { Injectable } from '@nestjs/common';
import { firebaseInstance } from '../../app/providers/initFirebase';

@Injectable()
export class PushNotificationsService {
  sendPushNotification(notificationData, deviceToken, badgeCount) {
    const convertedObjectToString = JSON.stringify(notificationData);
    const notificationStringfyObject = {
      data: convertedObjectToString,
    };
    for (const token of deviceToken) {
      const message = {
        notification: {
          title: 'Slasher',
          body: notificationData.notificationMsg,
        },
        apns: {
          payload: {
            aps: {
              badge: badgeCount,
            },
          },
        },
        data: notificationStringfyObject,
        token,
      };
      this.triggerPushNotification(message);
    }
  }

  triggerPushNotification(message) {
    return new Promise((resolve) => {
      firebaseInstance.admin.messaging().send(message)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          resolve(error);
        });
    });
  }
}
