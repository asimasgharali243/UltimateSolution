import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Divider, Button, CircularProgress, Alert } from '@mui/material';
import { Edit as EditIcon, ArrowBack as BackIcon } from '@mui/icons-material';

const StockProductDetail = ({ product, onBack, onEdit }) => {
  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === '') return '';
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  if (!product) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No product data available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={containerStyles}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'left' }}>
        <Typography variant="h5" component="h2" sx={headerStyles}>
          Product Details
        </Typography>
      </Box>

      <Card sx={cardStyles}>
        <CardContent sx={{ p: 3 }}>
          {/* Row 1: Name, Date, Opening Quantity, Opening Rate */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography sx={labelStyles}>
                Name <span style={requiredStarStyles}>*</span>
              </Typography>
              <ReadOnlyField value={product.itemName} />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Typography sx={labelStyles}>
                Date <span style={requiredStarStyles}>*</span>
              </Typography>
              <ReadOnlyField value={formatDate(product.date)} />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Typography sx={labelStyles}>Opening Quantity</Typography>
              <ReadOnlyField value={product.openingQuantity} />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Typography sx={labelStyles}>Opening Rate</Typography>
              <ReadOnlyField value={formatCurrency(product.openingRate)} />
            </Grid>
          </Grid>

          {/* Row 2: Code/Number, Stock Asset Account, Minimum Level */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography sx={labelStyles}>
                Code / Number <span style={requiredStarStyles}>*</span>
              </Typography>
              <ReadOnlyField value={product.itemCode} />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography sx={labelStyles}>
                Stock Asset Account <span style={requiredStarStyles}>*</span>
              </Typography>
              <ReadOnlyField value={product.stockAssetAccountName} />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography sx={labelStyles}>Minimum Level</Typography>
              <ReadOnlyField value={product.minLevel} />
            </Grid>
          </Grid>

          {/* Row 3: Category, Item Group, Income Account, Sale Price */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <Typography sx={labelStyles}>
                Category <span style={requiredStarStyles}>*</span>
              </Typography>
              <ReadOnlyField value={product.categoryName} />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography sx={labelStyles}>
                Item Group <span style={requiredStarStyles}>*</span>
              </Typography>
              <ReadOnlyField value={product.groupName} />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography sx={labelStyles}>
                Income Account <span style={requiredStarStyles}>*</span>
              </Typography>
              <ReadOnlyField value={product.incomeAccountName} />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography sx={labelStyles}>Sale Price</Typography>
              <ReadOnlyField value={formatCurrency(product.sRate)} />
            </Grid>
          </Grid>

          {/* Row 4: Notes, Expense Account, Cost, Unit */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography sx={labelStyles}>Notes</Typography>
              <ReadOnlyField value={product.notes} multiline rows={5} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelStyles}>
                    Expense Account <span style={requiredStarStyles}>*</span>
                  </Typography>
                  <ReadOnlyField value={product?.expenseAccountName} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography sx={labelStyles}>Cost</Typography>
                  <ReadOnlyField value={formatCurrency(product.pRate)} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography sx={labelStyles}>
                    Unit <span style={requiredStarStyles}>*</span>
                  </Typography>
                  <ReadOnlyField value={product.unitName} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, backgroundColor: '#e9ecef' }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 4 }}>
            <Button variant="outlined" onClick={onBack} sx={cancelButtonStyles} startIcon={<BackIcon />}>
              Back to List
            </Button>
            <Button variant="contained" onClick={() => onEdit(product)} sx={saveButtonStyles} startIcon={<EditIcon />}>
              Edit Product
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// ReadOnly Field Component - Matches the exact styling of form fields
const ReadOnlyField = ({ value, multiline = false, rows = 1 }) => {
  const displayValue = value || '';

  return (
    <Box
      sx={{
        p: '8.5px 14px',
        borderRadius: '6px',
        border: '1px solid #dee2e6',
        backgroundColor: '#fafbfc',
        minHeight: multiline ? `${rows * 24}px` : '40px',
        display: 'flex',
        alignItems: multiline ? 'flex-start' : 'center',
        fontFamily: 'inherit',
        fontSize: '0.9rem',
        color: '#2c3e50',
        fontWeight: 500,
        whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      {displayValue}
    </Box>
  );
};

// EXACT SAME STYLES AS YOUR FORM
const containerStyles = {
  margin: '0 auto',
  p: 2,
  backgroundColor: '#f5f7fa',
  minHeight: '100vh',
  fontFamily: 'Arial, sans-serif'
};

const headerStyles = {
  fontWeight: 600,
  color: '#2c3e50',
  fontSize: '1.5rem',
  mb: 1
};

const labelStyles = {
  fontWeight: 500,
  color: '#6c757d',
  fontSize: '0.8rem',
  mb: 1,
  display: 'block'
};

const requiredStarStyles = {
  color: '#d32f2f',
  fontWeight: 'bold',
  marginLeft: '2px'
};

const cardStyles = {
  borderRadius: '8px',
  border: '1px solid #e1e5e9',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  backgroundColor: '#ffffff'
};

const cancelButtonStyles = {
  borderRadius: '6px',
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '0.875rem',
  borderColor: '#6c757d',
  color: '#6c757d',
  px: 3,
  py: 1,
  '&:hover': {
    borderColor: '#495057',
    backgroundColor: 'rgba(108, 117, 125, 0.04)'
  }
};

const saveButtonStyles = {
  borderRadius: '6px',
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '0.875rem',
  backgroundColor: '#28a745',
  px: 3,
  py: 1,
  '&:hover': {
    backgroundColor: '#218838'
  }
};

export default StockProductDetail;
