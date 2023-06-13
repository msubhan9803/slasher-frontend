import { Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

type FirebaseAdmin = typeof admin;

const logger = new Logger('initFirebase');

// Initialize Firebase app
export const firebaseInstance = {
  admin: null as (null | FirebaseAdmin),
};

export function initiateFirebase(firebaseServerKey: string) {
  const serviceAccount = firebaseServerKey && JSON.parse(firebaseServerKey);
  if (serviceAccount && serviceAccount.project_id) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } else {
    logger.warn('Firebase instance was not initialized because a valid config was not found.');
  }
  firebaseInstance.admin = admin;
}
