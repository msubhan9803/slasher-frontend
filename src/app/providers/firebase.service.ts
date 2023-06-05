import * as admin from 'firebase-admin';

// Initialize Firebase app
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVER_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default admin;
