import * as admin from 'firebase-admin';

const USE_FIREBASE = process.env.USE_FIREBASE === 'true' || process.env.VITE_USE_FIREBASE === 'true';

let firebaseInitialized = false;

if (USE_FIREBASE) {
    try {
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            console.log('Backend: Initializing Firebase Admin via GOOGLE_APPLICATION_CREDENTIALS path.');
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
            firebaseInitialized = true;
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            console.log('Backend: Initializing Firebase Admin via FIREBASE_SERVICE_ACCOUNT_JSON string.');
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
            firebaseInitialized = true;
        } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            console.log('Backend: Initializing Firebase Admin from separate env vars.');
            const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
            firebaseInitialized = true;
        } else {
            console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.warn('Backend: No Firebase credentials found.');
            console.warn('Firebase Admin SDK will NOT be available.');
            console.warn('Auth will use JWT-only mode.');
            console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    } catch (error) {
        console.error('Backend: Firebase Admin initialization failed!', error);
    }
} else {
    console.log('Backend: Firebase is disabled (USE_FIREBASE=false). Skipping initialization.');
}

const getService = (name: 'auth' | 'firestore' | 'storage') => {
    if (!USE_FIREBASE || !firebaseInitialized) return null;
    try {
        if (name === 'auth') return admin.auth();
        if (name === 'firestore') return admin.firestore();
        if (name === 'storage') return admin.storage();
    } catch (e) {
        console.error(`Firebase: ${name} service requested but not available.`);
        return null;
    }
    return null;
};

export const firebaseAdminReady = firebaseInitialized;
export const auth = getService('auth');
export const db = getService('firestore');
export const storage = getService('storage');

export default admin;
