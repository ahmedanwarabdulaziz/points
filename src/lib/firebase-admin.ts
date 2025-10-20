/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Check if we have the required environment variables
const hasAdminCredentials = 
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL !== 'firebase-adminsdk-xxxxx@cadeala-cd61d.iam.gserviceaccount.com' &&
  process.env.FIREBASE_PRIVATE_KEY !== '-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n';

let app: any = null;
let adminAuth: any = null;
let adminDb: any = null;

if (hasAdminCredentials) {
  try {
    // Initialize Firebase Admin SDK
    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    };

    // Initialize the app if it hasn't been initialized yet
    app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
    
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error: unknown) {
    console.error('❌ Firebase Admin initialization error:', error instanceof Error ? error.message : 'Unknown error');
    app = null;
    adminAuth = null;
    adminDb = null;
  }
} else {
  console.log('⚠️ Firebase Admin SDK credentials not configured - using client SDK only');
}

export { adminAuth, adminDb };
export default app;
