import { Injectable } from '@nestjs/common';
import admin from '../../app/providers/firebase.service';

@Injectable()
export class PushNotificationsService {
  sendPushNotification(notificationData, deviceToken) {
    const convertedObjectToString = JSON.stringify(notificationData);
    const notificationStringfyObject = {
      data: convertedObjectToString,
    };
    return new Promise((resolve, reject) => {
      for (const token of deviceToken) {
        const message = {
          notification: {
            title: 'Slasher',
            body: notificationData.notificationMsg,
          },
          data: notificationStringfyObject,
          token,
        };
        admin.messaging().send(message)
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }
}
