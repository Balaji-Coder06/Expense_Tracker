// src/firebaseConfig.js
import { initializeApp } from 'firebase/app'; // Core Firebase app
import { getAuth } from 'firebase/auth';     // For Authentication service
import { getFirestore } from 'firebase/firestore'; // For Firestore database service

// Your Firebase configuration object from the Firebase Console
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll use
export const auth = getAuth(app); // Get the Auth instance
export const db = getFirestore(app); // Get the Firestore instance

// You can also export the app instance if needed for other services:
// export default app;
