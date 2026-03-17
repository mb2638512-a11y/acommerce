// Firebase SDK imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyCzjreTSmDX1CicjY8cHsngyekea9lYNBk",
 authDomain: "acommerce-42565.firebaseapp.com",
 projectId: "acommerce-42565",
 storageBucket: "acommerce-42565.firebasestorage.app",
 messagingSenderId: "231208905773",
 appId: "1:231208905773:web:32b163a50c1d2a0c3e9ca4",
 measurementId: "G-2W1G3TX5RT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Setup Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Export all Firebase services
export { app, analytics, db, auth, storage, googleProvider };
