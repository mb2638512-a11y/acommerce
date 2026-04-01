// Firebase SDK imports
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
 apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
 authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
 projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
 storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
 messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
 appId: import.meta.env.VITE_FIREBASE_APP_ID,
 measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Track if Firebase is initialized
let firebaseInitialized = false;
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// Validate Firebase config before attempting initialization
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
const isConfigValid = requiredConfigKeys.every(
 key => firebaseConfig[key] && !firebaseConfig[key].startsWith('AIzaSyB-placeholder') && firebaseConfig[key] !== 'placeholder'
);

if (!isConfigValid) {
 console.error(
  "Firebase: Missing or invalid configuration. Google Sign-In will be unavailable.\n" +
  "Required env vars: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID\n" +
  "Get your config from: https://console.firebase.google.com/project/acommerce-42565/settings/general"
 );
}

// Try to initialize Firebase only if config is valid
if (isConfigValid) {
 try {
  app = initializeApp(firebaseConfig);
  firebaseInitialized = true;

  try {
   auth = getAuth(app);
  } catch (e) {
   console.warn("Firebase Auth initialization failed:", e);
   firebaseInitialized = false;
  }

  // Setup Google Provider
  if (auth) {
   googleProvider = new GoogleAuthProvider();
   googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
 } catch (error) {
  console.error("Firebase initialization failed:", error);
 }
}

// Export Firebase services needed on initial app load.
export { app, auth, googleProvider };
export { firebaseInitialized };

// Initialize Firestore and Storage (lazy initialization)
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

if (app && firebaseInitialized) {
 try {
  db = getFirestore(app);
 } catch (e) {
  console.warn("Firebase Firestore initialization failed:", e);
 }

 try {
  storage = getStorage(app);
 } catch (e) {
  console.warn("Firebase Storage initialization failed:", e);
 }
}

export { db, storage };
