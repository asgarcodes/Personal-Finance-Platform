
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check for missing environment variables
if (typeof window !== "undefined") {
    const missingVars = Object.entries(firebaseConfig)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        console.warn("⚠️ Firebase Warning: Some configuration keys are missing. This may cause 'auth/configuration-not-found' error.", missingVars);
        if (!firebaseConfig.authDomain) {
            console.error("🚨 CRITICAL: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing in .env.local!");
        }
    }
}

import { getAuth } from "firebase/auth";

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling to prevent hanging connections on some hosting environments like Vercel
let db: Firestore;
try {
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
    });
} catch (e) {
    // If already initialized, get the existing instance
    db = getFirestore(app);
}

export { app, db, auth };
