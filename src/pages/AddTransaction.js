// src/pages/AddTransaction.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addTransaction } from '../firebaseUtils';

// Import MUI components
import {
  Container, Paper, Typography, TextField, Button,
  Box, FormControl, InputLabel, Select, MenuItem,
  Alert, CircularProgress // CircularProgress for loading indicator
} from '@mui/material';

function AddTransaction() {
  const { currentUser } = useAuth();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const expenseCategories = ["Food", "Transport", "Utilities", "Rent", "Entertainment", "Shopping", "Health", "Education", "Other"];
  const incomeCategories = ["Salary", "Freelance", "Investment", "Gift", "Other Income"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!currentUser) {
      setError('You must be logged in to add a transaction.');
      setLoading(false);
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be positive.');
      setLoading(false);
      return;
    }

    try {
      const newTransaction = {
        userId: currentUser.uid,
        type,
        amount: parseFloat(amount), // Ensure amount is stored as a number
        category,
        date: new Date(date), // Convert date string to Date object
        description,
        createdAt: new Date(), // Timestamp for when it was added
      };
      await addTransaction(currentUser.uid, newTransaction);
      setSuccess('Transaction added successfully!');
      // Reset form fields
      setType('expense');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      navigate('/'); // Optionally navigate back to dashboard
    } catch (err) {
      setError('Failed to add transaction: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Add New Transaction
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth required>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              id="type-select"
              value={type}
              label="Type"
              onChange={(e) => {
                setType(e.target.value);
                setCategory(''); // Clear category when type changes
              }}
            >
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="income">Income</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Amount"
            type="number"
            step="0.01"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            margin="normal"
            InputProps={{ inputProps: { min: 0 } }}
          />

          <FormControl fullWidth required>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category-select"
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">Select category</MenuItem>
              {(type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Date"
            type="date"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Description"
            multiline
            rows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
            disabled={loading || !category || !amount || !date || !description} // Disable if fields are empty
            startIcon={loading && <CircularProgress size={20} color="inherit" />} // Show spinner on button
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default AddTransaction;