import { Injectable } from '@nestjs/common';

import * as serviceAccount from '../../../slasher-cap.json';

const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

@Injectable()
export class PushNotificationsService {
  async sendPushNotification(notificationData) {
    return new Promise(async (resolve, reject) => {
      try {
        const registrationToken = ['qRtGhU3poeJpoMd:APA91bHTypfImlv0ncRecwZD3tb1z5HMTF1MQmN4irh1KP9qW0oo5Xzu6l0lyKIW3prK00IFz_fxEXaGhFuEQUKHVCNTlcfRrCZdc2OaC6AVGxTI6KzV33srih2sgOwo5Uq0G2K-O-o_'];

        const payload = {
          notification: {
            // title: fcmData.title,
            title: 'Slasher',
            body: notificationData.notificationMsg,
          },
          data: {
            userId: notificationData?.userId,
            senderId: notificationData.senderId,
            notifyType: notificationData.notifyType,
          },
        };
        console.log('message', payload);

        admin
          .messaging()
          .sendToDevice(registrationToken, payload, {
            priority: 'high',
          })
          .then((response) => {
            console.log('message succesfully sent !');
          })
          .catch((error) => {
            console.log('error', error);

            // res.send(error).status(500);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
}
