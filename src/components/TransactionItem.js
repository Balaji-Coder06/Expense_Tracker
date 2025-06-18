// src/components/TransactionItem.js
import React from 'react';

// Import MUI components
import { Paper, Typography, Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function TransactionItem({ transaction, onDelete, onEdit }) {
  const isExpense = transaction.type === 'expense';
  const amountColor = isExpense ? 'error.main' : 'success.main'; // MUI palette colors

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {transaction.description || 'No description'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {transaction.category} - {new Date(transaction.date?.seconds * 1000).toLocaleDateString()}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ color: amountColor, fontWeight: 'bold', mr: 2 }}>
          {isExpense ? '-' : '+'}${transaction.amount.toFixed(2)}
        </Typography>
        <Tooltip title="Edit Transaction">
          <IconButton onClick={() => onEdit(transaction)} color="primary" size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Transaction">
          <IconButton onClick={() => onDelete(transaction.id)} color="error" size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}

export default TransactionItem;