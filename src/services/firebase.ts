/**
 * Firebase Configuration and Initialization
 * This file sets up Firebase services for the Points Redeem app
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
// Storage will be added later - using public URLs for images for now

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyAQWllvvMDrbkBKUFMQQT9cNTrOKKjhPPo",
  authDomain: "points-project-973dd.firebaseapp.com",
  projectId: "points-project-973dd",
  storageBucket: "points-project-973dd.firebasestorage.app",
  messagingSenderId: "316893069197",
  appId: "1:316893069197:web:add57488e8ac5c2b95c7c4"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Only initialize if not already initialized
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

// Export Firebase instances
export { app, auth, db };

// Export Firebase types for convenience
export type { FirebaseApp, Auth, Firestore };

