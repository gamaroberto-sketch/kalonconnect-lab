import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        // For local development, you can use service account JSON
        // For production (Vercel), use environment variables
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            : {
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });

        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();

export default admin;
