// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig'; // Make sure this path points to your initialized Firebase auth instance
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged // Import onAuthStateChanged directly
} from 'firebase/auth';

// Create a Context object
const AuthContext = createContext();

// Custom hook to easily access auth context values
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps your app and provides auth state
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Stores the logged-in user object
  const [loading, setLoading] = useState(true); // True while checking auth state

  // This useEffect listens for Firebase auth state changes
  useEffect(() => {
    // onAuthStateChanged is Firebase's built-in observer for authentication state
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user); // Set current user (will be null if logged out)
      setLoading(false);    // Authentication check is complete
    });

    // Unsubscribe when component unmounts to prevent memory leaks
    return unsubscribe;
  }, []); // Empty dependency array means this runs once on mount

  // Firebase authentication functions
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    // Call Firebase's signOut function
    return signOut(auth);
  };

  // Value that will be provided to all components wrapped by AuthProvider
  const value = {
    currentUser,
    loading,
    signup, // Expose signup function
    login,  // Expose login function
    logout  // Expose logout function (no need for logoutUser alias)
  };

  // Render children only when the initial authentication check is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};