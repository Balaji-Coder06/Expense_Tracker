// src/pages/Reports.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTransactions } from '../firebaseUtils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameMonth,
  isSameYear,
} from 'date-fns';

import { Link } from 'react-router-dom';

// Import MUI components
import {
  Container, Paper, Typography, Box, Grid,
  Button, Select, MenuItem, InputLabel, FormControl,
  Alert, CircularProgress
} from '@mui/material';

// Import Chart.js components
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);


function Reports() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM')); // YYYY-MM format
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString()); // YYYY format

  const fetchTransactions = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      setTransactions([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      // For reports, fetch all transactions for the selected year to allow month filtering
      const startDate = startOfYear(new Date(parseInt(selectedYear), 0, 1));
      const endDate = endOfYear(new Date(parseInt(selectedYear), 11, 31));

      const fetchedTransactions = await getTransactions(
        currentUser.uid,
        startDate,
        endDate
      );
      setTransactions(fetchedTransactions);
    } catch (err) {
      setError('Failed to fetch transactions: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedYear]); // Depend on currentUser and selectedYear

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    const filterDate = new Date(selectedMonth); // Use selectedMonth for filtering
    return transactions.filter(t =>
      isSameMonth(new Date(t.date.seconds * 1000), filterDate) &&
      isSameYear(new Date(t.date.seconds * 1000), filterDate)
    );
  }, [transactions, selectedMonth]);


  // --- Chart Data Calculations ---

  // Expense by Category (Doughnut Chart)
  const expenseByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const expenseDoughnutData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        data: Object.values(expenseByCategory),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#CD5C5C', '#8A2BE2', '#7FFF00', '#D2B48C'
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#CD5C5C', '#8A2BE2', '#7FFF00', '#D2B48C'
        ],
      },
    ],
  };

  const expenseDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Expenses by Category',
        font: { size: 16 }
      }
    }
  };


  // Income vs Expense (Bar Chart)
  const monthlySummary = {
    income: filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    expense: filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
  };

  const incomeExpenseBarData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        data: [monthlySummary.income, monthlySummary.expense],
        backgroundColor: ['#28a745', '#dc3545'], // Green for income, Red for expense
        borderColor: ['#28a745', '#dc3545'],
        borderWidth: 1,
      },
    ],
  };

  const incomeExpenseBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Income vs. Expenses',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // --- Date Picker Logic ---
  const getMonthOptions = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(format(new Date(2000, i, 1), 'yyyy-MM')); // Use a dummy year
    }
    return months;
  };

  const getYearOptions = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) { // Last 5 years
      years.push(i.toString());
    }
    return years;
  };

  // --- Export Functionality ---
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export for the selected month.');
      return;
    }

    const headers = ["Date", "Type", "Category", "Amount", "Description"];
    const rows = filteredTransactions.map(t => [
      format(new Date(t.date.seconds * 1000), 'yyyy-MM-dd'),
      t.type,
      t.category,
      t.amount.toFixed(2),
      t.description,
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">Please log in to view reports.</Typography>
        <Button component={Link} to="/auth" variant="contained" sx={{ mt: 2 }}>Login / Sign Up</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading reports...</Typography>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && (
        <>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Financial Reports
          </Typography>

          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="month-select-label">Select Month</InputLabel>
                  <Select
                    labelId="month-select-label"
                    id="month-select"
                    value={selectedMonth}
                    label="Select Month"
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {getMonthOptions().map((month) => (
                      <MenuItem key={month} value={month}>
                        {format(new Date(month), 'MMMM yyyy')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="year-select-label">Select Year</InputLabel>
                  <Select
                    labelId="year-select-label"
                    id="year-select"
                    value={selectedYear}
                    label="Select Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {getYearOptions().map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={exportToCSV}
                  sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#115293' } }}
                >
                  Export CSV
                </Button>
                {/* PDF export button, if you want to implement jsPDF */}
                {/* <Button variant="contained" onClick={exportToPDF} color="secondary">
                  Export PDF
                </Button> */}
              </Grid>
            </Grid>
          </Paper>

          {filteredTransactions.length === 0 && (
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center', mt: 3, backgroundColor: '#fff' }}>
              <Typography variant="body1" color="text.secondary">
                No transactions found for {format(new Date(selectedMonth), 'MMMM yyyy')}.
              </Typography>
            </Paper>
          )}

          {filteredTransactions.length > 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {Object.keys(expenseByCategory).length > 0 ? (
                    <Doughnut data={expenseDoughnutData} options={expenseDoughnutOptions} />
                  ) : (
                    <Typography variant="body1" color="text.secondary">No expenses to display for this month.</Typography>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Bar data={incomeExpenseBarData} options={incomeExpenseBarOptions} />
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Container>
  );
}

export default Reports;