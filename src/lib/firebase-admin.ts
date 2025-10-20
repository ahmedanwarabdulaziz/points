import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID || "cadeala-cd61d",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  projectId: process.env.FIREBASE_PROJECT_ID || "cadeala-cd61d",
};

// Initialize the app if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

// Export the auth and firestore instances
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export default app;
