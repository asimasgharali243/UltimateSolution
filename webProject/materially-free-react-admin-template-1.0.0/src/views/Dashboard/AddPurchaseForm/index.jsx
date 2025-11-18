import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  Select,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Import APIs
import { useGetAllAccountsQuery } from '../../../store/api/level4Api';
import { useGetItemsQuery } from '../../../store/api/itemApi';
import { useCreatePurchaseMutation } from '../../../store/api/purchaseApi';

const AddPurchaseForm = ({ mode = 'create', purchase = null, onSave = () => {}, onCancel = () => {} }) => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    accountID: '',
    notes: '',
    lessDiscount: 0,
    addFreight: 0
  });

  const [purchaseDetails, setPurchaseDetails] = useState([
    {
      id: Date.now(),
      itemID: '',
      itemName: '',
      itemCode: '',
      itemRemarks: '',
      qty: 1,
      price: 0,
      total: 0,
      isEditing: true,
      stock: 0
    }
  ]);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch data using RTK Query
  const { data: accountsResponse, isLoading: accountsLoading, error: accountsError } = useGetAllAccountsQuery();
  const { data: itemsResponse, isLoading: itemsLoading, error: itemsError } = useGetItemsQuery();
  const [createPurchase, { isLoading: creatingPurchase }] = useCreatePurchaseMutation();

  // Transform data
  const accounts = Array.isArray(accountsResponse?.data) ? accountsResponse.data : Array.isArray(accountsResponse) ? accountsResponse : [];
  const items = Array.isArray(itemsResponse?.data) ? itemsResponse.data : Array.isArray(itemsResponse) ? itemsResponse : [];

  // Format accounts for dropdown
  const formattedAccounts = accounts.map((account) => {
    if (account.value !== undefined && account.label !== undefined) {
      return {
        value: account.value,
        label: account.label
      };
    } else {
      return {
        value: account.accountID,
        label: account.accountTitle || `Account ${account.accountID}`
      };
    }
  });

  // Calculate totals
  const calculateTotals = () => {
    const totalAmount = purchaseDetails.reduce((sum, detail) => sum + detail.qty * detail.price, 0);
    const totalQty = purchaseDetails.reduce((sum, detail) => sum + parseFloat(detail.qty || 0), 0);
    const netTotal = totalAmount - (parseFloat(formData.lessDiscount) || 0) + (parseFloat(formData.addFreight) || 0);

    return { totalAmount, totalQty, netTotal };
  };

  const { totalAmount, totalQty, netTotal } = calculateTotals();

  // Improved validation functions
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'date':
        if (!value) {
          error = 'Date is required';
        } else if (new Date(value) > new Date()) {
          error = 'Date cannot be in the future';
        }
        break;

      case 'accountID':
        if (!value) {
          error = 'Account is required';
        }
        break;

      case 'lessDiscount':
        if (value && (parseFloat(value) < 0 || isNaN(parseFloat(value)))) {
          error = 'Discount must be a positive number';
        }
        break;

      case 'addFreight':
        if (value && (parseFloat(value) < 0 || isNaN(parseFloat(value)))) {
          error = 'Freight must be a positive number';
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Validate purchase detail row
  const validateDetailRow = (detail, index) => {
    const rowErrors = {};

    if (!detail.itemID) {
      rowErrors.itemID = 'Item is required';
    }
    if (!detail.qty || detail.qty <= 0) {
      rowErrors.qty = 'Quantity must be greater than 0';
    }
    if (!detail.price || detail.price <= 0) {
      rowErrors.price = 'Price must be greater than 0';
    }

    return rowErrors;
  };

  // Improved form validation
  const validateForm = () => {
    const newErrors = {};

    // Validate main form fields
    const dateError = validateField('date', formData.date);
    const accountIDError = validateField('accountID', formData.accountID);
    const lessDiscountError = validateField('lessDiscount', formData.lessDiscount);
    const addFreightError = validateField('addFreight', formData.addFreight);

    if (dateError) newErrors.date = dateError;
    if (accountIDError) newErrors.accountID = accountIDError;
    if (lessDiscountError) newErrors.lessDiscount = lessDiscountError;
    if (addFreightError) newErrors.addFreight = addFreightError;

    // Validate purchase details
    let hasRowErrors = false;
    purchaseDetails.forEach((detail, index) => {
      const rowErrors = validateDetailRow(detail, index);
      if (Object.keys(rowErrors).length > 0) {
        newErrors[`row_${index}`] = rowErrors;
        hasRowErrors = true;
      }
    });

    // Check if at least one item is added
    if (purchaseDetails.length === 0 || purchaseDetails.every((detail) => !detail.itemID)) {
      newErrors.purchaseDetails = 'At least one purchase item is required';
    }

    console.log('🔍 DEBUG - Validation Errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear errors for a specific field
  const clearError = (fieldName) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Clear row errors
  const clearRowErrors = (index) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`row_${index}`];
      return newErrors;
    });
  };

  const handleBlur = (field) => (event) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true
    }));

    const error = validateField(field, formData[field]);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [field]: error
      }));
    } else {
      clearError(field);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      const error = validateField(field, value);
      if (!error) {
        clearError(field);
      }
    }
  };

  // Improved purchase details handler
  const handleDetailChange = (index, field) => (event) => {
    const value = event.target.value;
    const updatedDetails = [...purchaseDetails];

    if (field === 'itemID') {
      const selectedItem = items.find((item) => item.itemID == value);
      if (selectedItem) {
        updatedDetails[index] = {
          ...updatedDetails[index],
          itemID: value,
          itemName: selectedItem.itemName,
          itemCode: selectedItem.itemCode,
          price: selectedItem.pRate || selectedItem.PRate || 0,
          stock: selectedItem.openingQuantity || 0
        };

        // Recalculate total
        updatedDetails[index].total = updatedDetails[index].qty * updatedDetails[index].price;

        // Clear item error when item is selected
        clearRowErrors(index);
        clearError('purchaseDetails');
      }
    } else {
      updatedDetails[index][field] = value;

      // Recalculate total when qty or price changes
      if (field === 'qty' || field === 'price') {
        updatedDetails[index].total = (parseFloat(updatedDetails[index].qty) || 0) * (parseFloat(updatedDetails[index].price) || 0);

        // Clear quantity/price errors when values become valid
        if (field === 'qty' && value > 0) {
          const rowErrors = validateDetailRow(updatedDetails[index], index);
          if (!rowErrors.qty) {
            clearRowErrors(index);
          }
        }
        if (field === 'price' && value > 0) {
          const rowErrors = validateDetailRow(updatedDetails[index], index);
          if (!rowErrors.price) {
            clearRowErrors(index);
          }
        }
      }
    }

    setPurchaseDetails(updatedDetails);
  };

  const addPurchaseDetail = () => {
    const newId = Date.now();
    setPurchaseDetails([
      ...purchaseDetails,
      {
        id: newId,
        itemID: '',
        itemName: '',
        itemCode: '',
        itemRemarks: '',
        qty: 1,
        price: 0,
        total: 0,
        isEditing: true,
        stock: 0
      }
    ]);
    setEditingRow(newId);
    clearError('purchaseDetails');
  };

  const removePurchaseDetail = (index) => {
    if (purchaseDetails.length > 1) {
      const updatedDetails = purchaseDetails.filter((_, i) => i !== index);
      setPurchaseDetails(updatedDetails);
      clearRowErrors(index);

      if (editingRow === purchaseDetails[index].id) {
        setEditingRow(null);
      }

      // Clear purchase details error if we have valid items
      if (updatedDetails.some((detail) => detail.itemID)) {
        clearError('purchaseDetails');
      }
    }
  };

  const startEditing = (id) => {
    setEditingRow(id);
    setPurchaseDetails(purchaseDetails.map((detail) => (detail.id === id ? { ...detail, isEditing: true } : detail)));
  };

  const stopEditing = (id) => {
    setEditingRow(null);
    setPurchaseDetails(purchaseDetails.map((detail) => (detail.id === id ? { ...detail, isEditing: false } : detail)));

    // Validate the row when editing stops
    const index = purchaseDetails.findIndex((detail) => detail.id === id);
    if (index !== -1) {
      const rowErrors = validateDetailRow(purchaseDetails[index], index);
      if (Object.keys(rowErrors).length > 0) {
        setErrors((prev) => ({
          ...prev,
          [`row_${index}`]: rowErrors
        }));
      } else {
        clearRowErrors(index);
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {
      date: true,
      accountID: true,
      lessDiscount: true,
      addFreight: true
    };
    setTouched(allTouched);

    if (!validateForm()) {
      showSnackbar('Please fix the validation errors before submitting', 'error');
      return;
    }

    // Stop editing all rows before submission
    setPurchaseDetails(purchaseDetails.map((detail) => ({ ...detail, isEditing: false })));
    setEditingRow(null);

    // Prepare data for backend - Map to CreatePurchaseRequest DTO
    const submitData = {
      date: formData.date,
      accountID: parseInt(formData.accountID),
      notes: formData.notes || '',
      lessDiscount: parseFloat(formData.lessDiscount) || 0,
      addFreight: parseFloat(formData.addFreight) || 0,
      PurchaseDetails: purchaseDetails.map((detail) => ({
        itemID: parseInt(detail.itemID),
        itemRemarks: detail.itemRemarks || '',
        qty: parseFloat(detail.qty),
        price: parseFloat(detail.price)
      }))
    };

    console.log('Submitting purchase data:', submitData);

    try {
      const result = await createPurchase(submitData).unwrap();
      showSnackbar('Purchase created successfully!', 'success');

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        accountID: '',
        notes: '',
        lessDiscount: 0,
        addFreight: 0
      });
      setPurchaseDetails([
        {
          id: Date.now(),
          itemID: '',
          itemName: '',
          itemCode: '',
          itemRemarks: '',
          qty: 1,
          price: 0,
          total: 0,
          isEditing: true,
          stock: 0
        }
      ]);
      setErrors({});
      setTouched({});
      setEditingRow(null);

      if (onSave) {
        onSave(result, 'Purchase created successfully!');
      }
    } catch (error) {
      console.error('Failed to create purchase:', error);
      const errorMessage = error?.data?.message || error?.error || 'Failed to create purchase';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleCancel = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      accountID: '',
      notes: '',
      lessDiscount: 0,
      addFreight: 0
    });
    setPurchaseDetails([
      {
        id: Date.now(),
        itemID: '',
        itemName: '',
        itemCode: '',
        itemRemarks: '',
        qty: 1,
        price: 0,
        total: 0,
        isEditing: true,
        stock: 0
      }
    ]);
    setErrors({});
    setTouched({});
    setEditingRow(null);

    if (onCancel) {
      onCancel();
    }
  };

  // Helper to get error for a specific field in a row
  const getRowError = (index, field) => {
    return errors[`row_${index}`]?.[field] || '';
  };

  // Safe rendering functions
  const renderAccounts = () => {
    if (accountsLoading) {
      return (
        <MenuItem disabled>
          <CircularProgress size={20} />
          <span style={{ marginLeft: 8 }}>Loading accounts...</span>
        </MenuItem>
      );
    }
    if (!Array.isArray(formattedAccounts) || formattedAccounts.length === 0) {
      return (
        <MenuItem disabled>
          <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>{accountsError ? 'Error loading accounts' : 'No accounts available'}</span>
        </MenuItem>
      );
    }
    return formattedAccounts.map((account) => (
      <MenuItem key={account.value} value={account.value} sx={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 500 }}>
        {account.label}
      </MenuItem>
    ));
  };

  const renderItems = () => {
    if (itemsLoading) {
      return (
        <MenuItem disabled>
          <CircularProgress size={20} />
          <span style={{ marginLeft: 8 }}>Loading items...</span>
        </MenuItem>
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return (
        <MenuItem disabled>
          <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>No items available</span>
        </MenuItem>
      );
    }
    return items.map((item) => (
      <MenuItem key={item.itemID} value={item.itemID} sx={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 500 }}>
        {item.itemName} ({item.itemCode}) - Stock: {item.openingQuantity || 0} - Rate: Rs {item.pRate || 0}
      </MenuItem>
    ));
  };

  return (
    <Box sx={containerStyles}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'left' }}>
        <Typography variant="h5" component="h2" sx={headerStyles}>
          {mode === 'create' ? 'Add Purchase' : 'Edit Purchase'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6c757d', fontSize: '0.9rem' }}>
          Create new purchase order with item details
        </Typography>
      </Box>

      {/* Show errors if any */}
      {accountsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load accounts: {accountsError.message}
        </Alert>
      )}
      {itemsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load items: {itemsError.message}
        </Alert>
      )}

      <Card sx={cardStyles}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              Basic Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={3}>
                <Typography sx={labelStyles}>
                  Date <span style={requiredStarStyles}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={formData.date}
                  onChange={handleChange('date')}
                  onBlur={handleBlur('date')}
                  size="small"
                  required
                  error={touched.date && !!errors.date}
                  helperText={touched.date && errors.date}
                  InputLabelProps={{ shrink: true }}
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={labelStyles}>
                  Supplier Account <span style={requiredStarStyles}>*</span>
                </Typography>
                <FormControl fullWidth size="small" error={touched.accountID && !!errors.accountID}>
                  <Select
                    value={formData.accountID}
                    onChange={handleChange('accountID')}
                    onBlur={handleBlur('accountID')}
                    displayEmpty
                    sx={selectStyles}
                  >
                    <MenuItem value="">
                      <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select supplier account...</span>
                    </MenuItem>
                    {renderAccounts()}
                  </Select>
                  {touched.accountID && errors.accountID && <FormHelperText sx={errorTextStyles}>{errors.accountID}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography sx={labelStyles}>Reference Notes</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Enter purchase reference notes..."
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  size="small"
                  sx={inputStyles}
                />
              </Grid>
            </Grid>

            {/* Purchase Items Section */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4, mb: 2 }}>
              <CalculateIcon color="primary" />
              Purchase Items
            </Typography>

            {errors.purchaseDetails && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.purchaseDetails}
              </Alert>
            )}

            <TableContainer component={Paper} sx={{ mb: 2, border: '1px solid #e9ecef' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Item Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Remarks</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Unit Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', width: '120px' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseDetails.map((detail, index) => (
                    <TableRow
                      key={detail.id}
                      sx={{
                        backgroundColor: detail.isEditing ? '#f0f7ff' : 'inherit',
                        '&:hover': { backgroundColor: '#f8f9fa' }
                      }}
                    >
                      {/* Item Selection */}
                      <TableCell>
                        {detail.isEditing ? (
                          <FormControl fullWidth size="small" error={!!getRowError(index, 'itemID')}>
                            <Select value={detail.itemID} onChange={handleDetailChange(index, 'itemID')} displayEmpty sx={selectStyles}>
                              <MenuItem value="">
                                <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select item...</span>
                              </MenuItem>
                              {renderItems()}
                            </Select>
                            {getRowError(index, 'itemID') && (
                              <FormHelperText sx={errorTextStyles}>{getRowError(index, 'itemID')}</FormHelperText>
                            )}
                          </FormControl>
                        ) : (
                          <Box>
                            <Typography variant="body2" fontWeight="500">
                              {detail.itemName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Code: {detail.itemCode} | Stock: {detail.stock}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>

                      {/* Remarks */}
                      <TableCell>
                        {detail.isEditing ? (
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Item remarks..."
                            value={detail.itemRemarks}
                            onChange={handleDetailChange(index, 'itemRemarks')}
                            sx={inputStyles}
                          />
                        ) : (
                          <Typography variant="body2">{detail.itemRemarks || '-'}</Typography>
                        )}
                      </TableCell>

                      {/* Quantity */}
                      <TableCell>
                        {detail.isEditing ? (
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={detail.qty}
                            onChange={handleDetailChange(index, 'qty')}
                            error={!!getRowError(index, 'qty')}
                            helperText={getRowError(index, 'qty')}
                            inputProps={{ min: 0.01, step: 0.01 }}
                            sx={inputStyles}
                          />
                        ) : (
                          <Typography variant="body2" align="center">
                            {detail.qty}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        {detail.isEditing ? (
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={detail.price}
                            onChange={handleDetailChange(index, 'price')}
                            error={!!getRowError(index, 'price')}
                            helperText={getRowError(index, 'price')}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">Rs</InputAdornment>
                            }}
                            inputProps={{ min: 0.01, step: 0.01 }}
                            sx={inputStyles}
                          />
                        ) : (
                          <Typography variant="body2" align="right">
                            Rs {formatCurrency(detail.price)}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Total */}
                      <TableCell>
                        <Typography variant="body2" align="right" fontWeight="500">
                          Rs {formatCurrency(detail.total)}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {detail.isEditing ? (
                            <>
                              <Tooltip title="Save">
                                <IconButton size="small" color="primary" onClick={() => stopEditing(detail.id)}>
                                  <SaveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel">
                                <IconButton
                                  size="small"
                                  color="inherit"
                                  onClick={() => {
                                    if (!detail.itemID && detail.qty === 1 && detail.price === 0) {
                                      removePurchaseDetail(index);
                                    } else {
                                      stopEditing(detail.id);
                                    }
                                  }}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => startEditing(detail.id)}
                                  disabled={editingRow !== null && editingRow !== detail.id}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removePurchaseDetail(index)}
                                  disabled={purchaseDetails.length === 1}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              startIcon={<AddIcon />}
              onClick={addPurchaseDetail}
              variant="outlined"
              size="small"
              sx={{ mb: 3 }}
              disabled={editingRow !== null}
            >
              Add New Item
            </Button>

            {/* Totals Section */}
            <Card variant="outlined" sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalculateIcon color="primary" />
                  Purchase Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography sx={labelStyles}>Total Amount</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={formatCurrency(totalAmount)}
                      InputProps={{
                        readOnly: true,
                        startAdornment: <InputAdornment position="start">Rs</InputAdornment>
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography sx={labelStyles}>Total Quantity</Typography>
                    <TextField fullWidth size="small" value={totalQty} InputProps={{ readOnly: true }} sx={inputStyles} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography sx={labelStyles}>Less Discount</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      value={formData.lessDiscount}
                      onChange={handleChange('lessDiscount')}
                      onBlur={handleBlur('lessDiscount')}
                      error={!!errors.lessDiscount}
                      helperText={errors.lessDiscount}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Rs</InputAdornment>
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography sx={labelStyles}>Add Freight</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      value={formData.addFreight}
                      onChange={handleChange('addFreight')}
                      onBlur={handleBlur('addFreight')}
                      error={!!errors.addFreight}
                      helperText={errors.addFreight}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Rs</InputAdornment>
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography sx={{ ...labelStyles, fontWeight: 'bold', color: 'primary.main', fontSize: '0.9rem' }}>
                      Net Total
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={formatCurrency(netTotal)}
                      InputProps={{
                        readOnly: true,
                        startAdornment: <InputAdornment position="start">Rs</InputAdornment>
                      }}
                      sx={{
                        ...inputStyles,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#e3f2fd',
                          fontWeight: 'bold',
                          '& fieldset': {
                            borderColor: '#1976d2',
                            borderWidth: '2px'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 3, backgroundColor: '#e9ecef' }} />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 4 }}>
              <Button variant="outlined" onClick={handleCancel} disabled={creatingPurchase} sx={cancelButtonStyles}>
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ color: 'white' }}
                variant="contained"
                disabled={creatingPurchase || editingRow !== null}
                sx={saveButtonStyles}
              >
                {creatingPurchase ? <CircularProgress size={24} /> : 'Save Purchase'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

// Styles
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

const errorTextStyles = {
  color: '#d32f2f',
  fontSize: '0.75rem',
  marginLeft: '14px',
  marginRight: '14px'
};

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    fontSize: '0.9rem',
    backgroundColor: '#fafbfc',
    '& fieldset': {
      borderColor: '#dee2e6'
    },
    '&:hover fieldset': {
      borderColor: '#adb5bd'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
      borderWidth: '1px'
    },
    '&.Mui-error fieldset': {
      borderColor: '#d32f2f'
    }
  },
  '& .MuiOutlinedInput-input': {
    color: '#2c3e50',
    fontWeight: 500
  },
  '& .MuiFormHelperText-root': {
    fontSize: '0.75rem',
    marginLeft: '0px'
  }
};

const selectStyles = {
  borderRadius: '6px',
  fontSize: '0.9rem',
  backgroundColor: '#fafbfc',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#dee2e6'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#adb5bd'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1976d2',
    borderWidth: '1px'
  },
  '&.Mui-error .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d32f2f'
  },
  '& .MuiSelect-select': {
    color: '#2c3e50',
    fontWeight: 500
  }
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
  },
  '&:disabled': {
    backgroundColor: '#8a8d90ff'
  }
};

export default AddPurchaseForm;
