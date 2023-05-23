import * as admin from 'firebase-admin';

// Initialize Firebase app
const serviceAccount = require('../../../slasher-cap.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default admin;
