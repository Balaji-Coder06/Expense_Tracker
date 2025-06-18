// src/firebaseConfig.js
import { initializeApp } from 'firebase/app'; // Core Firebase app
import { getAuth } from 'firebase/auth';     // For Authentication service
import { getFirestore } from 'firebase/firestore'; // For Firestore database service

// Your Firebase configuration object from the Firebase Console
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPQyjI1Wqe2Kb5FviRNPJiVTlZXoRHnCE",
  authDomain: "expensetrackerapp-32672.firebaseapp.com",
  projectId: "expensetrackerapp-32672",
  storageBucket: "expensetrackerapp-32672.firebasestorage.app",
  messagingSenderId: "66955718426",
  appId: "1:66955718426:web:52317fd4ad782295bf46a3",
  measurementId: "G-VDZTVGPPPS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll use
export const auth = getAuth(app); // Get the Auth instance
export const db = getFirestore(app); // Get the Firestore instance

// You can also export the app instance if needed for other services:
// export default app;