// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Reports from './pages/Reports';
import Auth from './pages/Auth';
import Navbar from './components/Navbar';

import { CssBaseline, Box } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>;
  }

  return currentUser ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
      <CssBaseline />
      {/* Apply background image from the public folder */}
      <Box
        sx={{
          minHeight: '100vh', // Ensures the background covers the entire viewport height
          // IMPORTANT: Changed URL to point to the local file in the public folder
          backgroundImage: 'url(/abstract-lines.jpg)', // <--- THIS LINE IS CHANGED
          backgroundSize: 'cover', // Scale the image to cover the entire container
          backgroundPosition: 'center', // Center the image in the container
          backgroundRepeat: 'no-repeat', // Prevent the image from repeating
          backgroundColor: '#f0f0f0', // Fallback background color in case the image fails to load
        }}
      >
        <NotificationProvider>
          <AuthProvider>
            <Navbar />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/add"
                element={
                  <PrivateRoute>
                    <AddTransaction />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AuthProvider>
        </NotificationProvider>
      </Box>
    </Router>
  );
}

export default App;