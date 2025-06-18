// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTransactions, deleteTransaction, updateTransaction } from '../firebaseUtils';
import TransactionItem from '../components/TransactionItem';
import { Link } from 'react-router-dom';

// Import MUI components
import {
  Container, Paper, Typography, Box, Grid,
  Button, TextField, Select, MenuItem, InputLabel, FormControl,
  Alert, CircularProgress // CircularProgress for loading indicator
} from '@mui/material';

function Dashboard() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);

  const { startOfMonth, endOfMonth } = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startOfMonth: start, endOfMonth: end };
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      setTransactions([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const fetchedTransactions = await getTransactions(
        currentUser.uid,
        startOfMonth,
        endOfMonth
      );
      setTransactions(fetchedTransactions);
    } catch (err) {
      setError('Failed to fetch transactions: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, startOfMonth, endOfMonth]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      setLoading(true);
      await deleteTransaction(currentUser.uid, id);
      // alert('Transaction deleted!'); // Replaced by more robust notification later
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction({
      ...transaction,
      date: transaction.date?.toDate().toISOString().split('T')[0]
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTransaction) return;

    try {
      setLoading(true);
      const updatedData = {
        type: editingTransaction.type,
        amount: parseFloat(editingTransaction.amount),
        category: editingTransaction.category,
        date: new Date(editingTransaction.date),
        description: editingTransaction.description,
      };

      await updateTransaction(currentUser.uid, editingTransaction.id, updatedData);
      // alert('Transaction updated successfully!'); // Replaced by notification
      setEditingTransaction(null);
      fetchTransactions();
    } catch (err) {
      setError('Failed to update transaction: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const expenseCategories = ["Food", "Transport", "Utilities", "Rent", "Entertainment", "Shopping", "Health", "Education", "Other"];
  const incomeCategories = ["Salary", "Freelance", "Investment", "Gift", "Other Income"];


  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">Please log in to view your dashboard.</Typography>
        <Button component={Link} to="/auth" variant="contained" sx={{ mt: 2 }}>Login / Sign Up</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard...</Typography>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && (
        <>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Dashboard - {startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
                <Typography variant="h6" color="text.secondary">Total Income</Typography>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  ${totalIncome.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', backgroundColor: '#ffebee' }}>
                <Typography variant="h6" color="text.secondary">Total Expenses</Typography>
                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                  ${totalExpenses.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', backgroundColor: netSavings >= 0 ? '#e3f2fd' : '#fbe9e7' }}>
                <Typography variant="h6" color="text.secondary">Net Savings</Typography>
                <Typography variant="h4" color={netSavings >= 0 ? 'primary.main' : 'warning.main'} sx={{ fontWeight: 'bold' }}>
                  ${netSavings.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, borderBottom: '1px solid #eee', pb: 1 }}>
            Recent Transactions (This Month)
          </Typography>

          {transactions.length === 0 ? (
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center', mt: 3, backgroundColor: '#fff' }}>
              <Typography variant="body1" color="text.secondary">
                No transactions recorded for this month.{' '}
                <Link to="/add" style={{ textDecoration: 'none' }}>
                  <Button variant="text" size="small">Add one now!</Button>
                </Link>
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ mt: 3 }}>
              {transactions.map(transaction => (
                <React.Fragment key={transaction.id}>
                  {editingTransaction && editingTransaction.id === transaction.id ? (
                    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6" gutterBottom>Editing Transaction</Typography>
                      <Box component="form" onSubmit={handleSaveEdit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth margin="dense">
                          <InputLabel id="type-select-label">Type</InputLabel>
                          <Select
                            labelId="type-select-label"
                            id="type-select"
                            value={editingTransaction.type}
                            label="Type"
                            onChange={e => setEditingTransaction({...editingTransaction, type: e.target.value})}
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
                          value={editingTransaction.amount}
                          onChange={e => setEditingTransaction({...editingTransaction, amount: e.target.value})}
                          required
                          margin="dense"
                        />
                        <FormControl fullWidth margin="dense">
                          <InputLabel id="category-select-label">Category</InputLabel>
                          <Select
                            labelId="category-select-label"
                            id="category-select"
                            value={editingTransaction.category}
                            label="Category"
                            onChange={e => setEditingTransaction({...editingTransaction, category: e.target.value})}
                            required
                          >
                            <MenuItem value="">Select category</MenuItem>
                            {(editingTransaction.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Date"
                          type="date"
                          fullWidth
                          value={editingTransaction.date}
                          onChange={e => setEditingTransaction({...editingTransaction, date: e.target.value})}
                          required
                          margin="dense"
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Description"
                          multiline
                          rows={2}
                          fullWidth
                          value={editingTransaction.description}
                          onChange={e => setEditingTransaction({...editingTransaction, description: e.target.value})}
                          margin="dense"
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                          <Button variant="contained" type="submit" disabled={loading}>Save</Button>
                          <Button variant="outlined" onClick={handleCancelEdit} disabled={loading}>Cancel</Button>
                        </Box>
                      </Box>
                    </Paper>
                  ) : (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  )}
                </React.Fragment>
              ))}
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default Dashboard;