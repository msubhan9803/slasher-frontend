/* eslint-disable class-methods-use-this */
import { Injectable } from '@nestjs/common';
import admin from '../../app/providers/firebase.service';

@Injectable()
export class PushNotificationsService {
  async sendPushNotification(notificationData, deviceToken) {
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
        data: notificationStringfyObject,
        token,
      };
      await this.triggerPushNotification(message);
    }
  }

  triggerPushNotification(message) {
    return new Promise((resolve, reject) => {
      admin.messaging().send(message)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
