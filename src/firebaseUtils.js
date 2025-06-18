// src/firebaseUtils.js
import { db, auth } from './firebaseConfig'; // Import db and auth from your firebaseConfig
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged // Used to listen for login/logout events
} from 'firebase/auth';

// --- Authentication Functions ---

/**
 * Signs up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} The user object on success.
 */
export const signup = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up:", error.message);
    throw error; // Re-throw to be handled by the component that calls this
  }
};

/**
 * Logs in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} The user object on success.
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error.message);
    throw error;
  }
};

/**
 * Logs out the current user.
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error.message);
    throw error;
  }
};

/**
 * Subscribes to Firebase authentication state changes.
 * @param {Function} callback - Function to call when auth state changes (receives user object or null).
 * @returns {Function} An unsubscribe function.
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// --- Firestore Transaction Functions ---

/**
 * Adds a new transaction for a specific user.
 * @param {string} userId - The ID of the current user.
 * @param {Object} transactionData - The transaction details (type, amount, category, date, description).
 * @returns {Promise<string>} The ID of the newly created document.
 */
export const addTransaction = async (userId, transactionData) => {
  try {
    // Add a timestamp for when the transaction was created in Firestore
    const docRef = await addDoc(collection(db, "users", userId, "transactions"), {
      ...transactionData,
      createdAt: new Date(), // Firebase Timestamp will be automatically stored
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding transaction:", error.message);
    throw error;
  }
};

/**
 * Fetches transactions for a specific user within a date range.
 * @param {string} userId - The ID of the current user.
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDate - The end date of the range.
 * @returns {Promise<Array<Object>>} An array of transaction objects.
 */
export const getTransactions = async (userId, startDate, endDate) => {
  try {
    if (!userId) {
      console.warn("getTransactions called without a userId. Skipping fetch.");
      return [];
    }
    // Create a query to filter by date and order by date (descending)
    const q = query(
      collection(db, "users", userId, "transactions"),
      where("date", ">=", startDate), // 'date' field in Firestore should be a Firebase Timestamp or JS Date
      where("date", "<=", endDate),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    // Map Firestore documents to a cleaner array of objects
    const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return transactions;
  } catch (error) {
    console.error("Error getting transactions:", error.message);
    throw error;
  }
};

/**
 * Updates an existing transaction.
 * @param {string} userId - The ID of the current user.
 * @param {string} transactionId - The ID of the transaction document to update.
 * @param {Object} newData - The new data to update in the transaction.
 * @returns {Promise<void>}
 */
export const updateTransaction = async (userId, transactionId, newData) => {
  try {
    if (!userId || !transactionId) {
      console.error("Missing userId or transactionId for update.");
      return;
    }
    const transactionRef = doc(db, "users", userId, "transactions", transactionId);
    await updateDoc(transactionRef, newData);
  } catch (error) {
    console.error("Error updating transaction:", error.message);
    throw error;
  }
};

/**
 * Deletes a transaction.
 * @param {string} userId - The ID of the current user.
 * @param {string} transactionId - The ID of the transaction document to delete.
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (userId, transactionId) => {
  try {
    if (!userId || !transactionId) {
      console.error("Missing userId or transactionId for delete.");
      return;
    }
    await deleteDoc(doc(db, "users", userId, "transactions", transactionId));
  } catch (error) {
    console.error("Error deleting transaction:", error.message);
    throw error;
  }
};