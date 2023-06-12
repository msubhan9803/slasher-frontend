import * as admin from 'firebase-admin';

type FirebaseAdmin = typeof admin;

// Initialize Firebase app
export const firebaseInstance = {
  admin: null as (null | FirebaseAdmin),
};

export function initiateFirebase(firebaseServerKey: string) {
  const serviceAccount = firebaseServerKey && JSON.parse(firebaseServerKey);
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }
  firebaseInstance.admin = admin;
}
