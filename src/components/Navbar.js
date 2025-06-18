// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Only need Link and useNavigate for routing
import { useAuth } from '../context/AuthContext'; // Correct path to AuthContext
import { useNotification } from '../context/NotificationContext'; // Correct path to NotificationContext

// Import MUI components
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';

function Navbar() {
  const { currentUser, logout, loading } = useAuth(); // Destructure logout from useAuth
  const { showNotification } = useNotification(); // Destructure showNotification from useNotification
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Calls the logout function from AuthContext
      navigate('/auth'); // Redirects to the auth page
      showNotification('Logged out successfully!', 'success'); // Use global notification
    } catch (error) {
      showNotification('Failed to log out: ' + error.message, 'error'); // Use global notification
      console.error(error);
    }
  };

  if (loading) {
    return null; // Don't render navbar during auth loading
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#333333' }}> {/* Or your chosen color */}
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Expense Tracker
          </Link>
        </Typography>
        <Box>
          {currentUser ? (
            <>
              {/* These are Link components, they don't need the actual page components imported here */}
              <Button color="inherit" component={Link} to="/">Dashboard</Button>
              <Button color="inherit" component={Link} to="/add">Add Transaction</Button>
              <Button color="inherit" component={Link} to="/reports">Reports</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/auth">Login / Sign Up</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;