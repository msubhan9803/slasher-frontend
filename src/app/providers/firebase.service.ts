import * as admin from 'firebase-admin';

// Initialize Firebase app
import * as serviceAccount from '../../../slasher-cap.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default admin;
