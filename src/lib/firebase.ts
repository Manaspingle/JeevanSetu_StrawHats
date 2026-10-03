import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCtHHpDdf4ZXXiisV_wZ5fy8XpW3XX91So",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "jeevansetu-5f8be.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "jeevansetu-5f8be",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "jeevansetu-5f8be.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "374716504140",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:374716504140:web:422c6f0cc83cc8a2177ce9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-162TV8H5NK"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Graceful fallback for sandboxed storage or local testing
  });
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (guarded with isSupported() for environments without cookie/window support)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Non-blocking in headless/testing environments
  });
}
