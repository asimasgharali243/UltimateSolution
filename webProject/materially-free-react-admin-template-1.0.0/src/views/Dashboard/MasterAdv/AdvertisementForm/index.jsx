// src/views/Dashboard/Advertisement/AdvertisementForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save as SaveIcon, ArrowBack as BackIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useCreateMasterMutation, useUpdateMasterMutation, useLazyCheckVNoExistsQuery } from '../../../../store/api/advertisementApi';
import { useGetAccountsQuery } from '../../../../store/api/accountApi';

const AdvertisementForm = ({ mode, master, onSave, onCancel, onRefetch }) => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  // API mutations
  const [createMaster, { isLoading: creating }] = useCreateMasterMutation();
  const [updateMaster, { isLoading: updating }] = useUpdateMasterMutation();
  const [checkVNoExists] = useLazyCheckVNoExistsQuery();

  // Use the account API to get all accounts
  const { data: accountsResponse, isLoading: accountsLoading } = useGetAccountsQuery();

  const loading = creating || updating;

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState({
    vNo: '',
    billNo: '',
    billDate: new Date().toISOString().split('T')[0],
    roNo: '',
    roDate: '',
    notes: '', // Fixed: changed from Notes to notes
    accountID: '',
    agencyName: '',
    pID: '',
    caption: '',
    frontPageExtra: 0,
    backPageExtra: 0,
    comission: 0,
    createdBy: user?.userID || 0,
    modifyBy: user?.userID || 0
  });

  const [detailRecords, setDetailRecords] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountOptions, setAccountOptions] = useState([]);
  const [filteredAccountOptions, setFilteredAccountOptions] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [vNoError, setVNoError] = useState('');
  const [vNoTimeout, setVNoTimeout] = useState(null);

  // Get accounts data
  const accounts = accountsResponse?.data || [];

  // Initialize account options when accounts data is loaded
  useEffect(() => {
    if (accounts.length > 0) {
      const options = accounts.map((account) => ({
        accountID: account.accountID,
        accountTitle: account.accountTitle,
        contactPersonName: account.contactPersonName,
        contactPersonMobile: account.contactPersonMobile,
        city: account.city,
        address: account.address
      }));
      setAccountOptions(options);
      setFilteredAccountOptions(options);
    }
  }, [accounts]);

  // Initialize form data - Fixed spelling mismatches
  useEffect(() => {
    if (mode === 'edit' && master) {
      const initialFormData = {
        vNo: master.vNo?.toString() || '',
        billNo: master.billNo || '',
        billDate: master.billDate ? new Date(master.billDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        roNo: master.roNo || '',
        roDate: master.roDate ? new Date(master.roDate).toISOString().split('T')[0] : '',
        notes: master.notes || '', // Fixed: changed from Notes to notes
        accountID: master.accountID?.toString() || '',
        agencyName: master.agencyName || '',
        pID: master.pID || '',
        caption: master.caption || '',
        frontPageExtra: master.frontPageExtra || 0,
        backPageExtra: master.backPageExtra || 0,
        comission: master.comission || 0,
        createdBy: master.createdBy || user?.userID || 0,
        modifyBy: user?.userID || 0
      };

      setFormData(initialFormData);

      // Set selected account if account data is available
      if (master.accountID) {
        // First try to find in accountOptions
        const accountFromOptions = accountOptions.find((acc) => acc.accountID === master.accountID);
        if (accountFromOptions) {
          setSelectedAccount(accountFromOptions);
        } else if (master.accountTitle) {
          // Fallback: create account object from master data
          setSelectedAccount({
            accountID: master.accountID,
            accountTitle: master.accountTitle, // Fixed: changed from AccountTitle to accountTitle
            contactPersonName: master.accountContactPerson, // Fixed: changed from AccountContactPerson to accountContactPerson
            contactPersonMobile: master.accountContactMobile // Fixed: changed from AccountContactMobile to accountContactMobile
          });
        }
      }

      // Set detail records - Fixed spelling mismatches
      if (master.details && master.details.length > 0) {
        // Fixed: changed from Details to details
        setDetailRecords(
          master.details.map((detail) => ({
            // Fixed: changed from Details to details
            inserationDate: detail.inserationDate ? new Date(detail.inserationDate).toISOString().split('T')[0] : '',
            color: detail.color || '',
            size: detail.size || '',
            totalSpace: detail.totalSpace || '',
            position: detail.position || '',
            rate: detail.rate || 0
          }))
        );
      } else {
        setDetailRecords([
          {
            inserationDate: '',
            color: '',
            size: '',
            totalSpace: '',
            position: 'F.P.',
            rate: 0
          }
        ]);
      }
    } else {
      // Reset form for create mode
      setFormData({
        vNo: '',
        billNo: '',
        billDate: new Date().toISOString().split('T')[0],
        roNo: '',
        roDate: '',
        notes: '', // Fixed: changed from Notes to notes
        accountID: '',
        agencyName: '',
        pID: '',
        caption: '',
        frontPageExtra: 0,
        backPageExtra: 0,
        comission: 0,
        createdBy: user?.userID || 0,
        modifyBy: user?.userID || 0
      });
      setSelectedAccount(null);
      setDetailRecords([
        {
          inserationDate: '',
          color: '',
          size: '',
          totalSpace: '',
          position: 'F.P.',
          rate: 0
        }
      ]);
    }
  }, [mode, master, user, accountOptions]);

  // Filter accounts based on search input
  const handleAccountSearch = (searchValue) => {
    if (!searchValue) {
      setFilteredAccountOptions(accountOptions);
      return;
    }

    const filtered = accountOptions.filter(
      (account) =>
        account.accountTitle?.toLowerCase().includes(searchValue.toLowerCase()) ||
        account.contactPersonName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        account.contactPersonMobile?.includes(searchValue)
    );
    setFilteredAccountOptions(filtered);
  };

  // Check if VNo exists
  const checkVNo = useCallback(
    async (vNo) => {
      if (!vNo || isNaN(vNo)) return;

      try {
        const result = await checkVNoExists(parseInt(vNo)).unwrap();
        if (result.success && result.data) {
          setVNoError('Voucher number already exists');
        } else {
          setVNoError('');
        }
      } catch (error) {
        console.error('Failed to check VNo:', error);
        setVNoError('');
      }
    },
    [checkVNoExists]
  );

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Check VNo uniqueness with debounce
    if (field === 'vNo') {
      // Clear previous timeout
      if (vNoTimeout) {
        clearTimeout(vNoTimeout);
      }

      if (value && !isNaN(value)) {
        const timeoutId = setTimeout(() => {
          checkVNo(value);
        }, 800);
        setVNoTimeout(timeoutId);
      } else {
        setVNoError('');
      }
    }
  };

  // Handle account selection
  const handleAccountSelect = (event, newValue) => {
    setSelectedAccount(newValue);
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        accountID: newValue.accountID?.toString() || ''
      }));
      // Clear account validation error
      if (validationErrors.accountID) {
        setValidationErrors((prev) => ({ ...prev, accountID: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, accountID: '' }));
    }
  };

  // Handle detail record changes
  const handleDetailChange = (index, field, value) => {
    const updatedRecords = [...detailRecords];
    updatedRecords[index] = { ...updatedRecords[index], [field]: value };
    setDetailRecords(updatedRecords);
  };

  // Add new detail record
  const addDetailRecord = () => {
    setDetailRecords((prev) => [
      ...prev,
      {
        inserationDate: '',
        color: '',
        size: '',
        totalSpace: '',
        position: 'F.P.',
        rate: 0
      }
    ]);
  };

  // Remove detail record
  const removeDetailRecord = (index) => {
    if (detailRecords.length > 1) {
      setDetailRecords((prev) => prev.filter((_, i) => i !== index));
    } else {
      // If it's the last record, just reset it instead of removing
      setDetailRecords([
        {
          inserationDate: '',
          color: '',
          size: '',
          totalSpace: '',
          position: 'F.P.',
          rate: 0
        }
      ]);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalAmount = detailRecords.reduce((sum, record) => {
      const spaceValue = parseInt(record.totalSpace) || 0;
      const rateValue = parseInt(record.rate) || 0;
      return sum + rateValue * spaceValue;
    }, 0);

    const frontPageExtraAmount = (totalAmount * (formData.frontPageExtra || 0)) / 100;
    const backPageExtraAmount = (totalAmount * (formData.backPageExtra || 0)) / 100;
    const extrasAmount = frontPageExtraAmount + backPageExtraAmount;
    const grossTotal = totalAmount + extrasAmount;
    const netAmount = grossTotal - (formData.comission || 0);

    return {
      totalAmount: Math.round(totalAmount),
      extrasAmount: Math.round(extrasAmount),
      grossTotal: Math.round(grossTotal),
      netAmount: Math.round(netAmount)
    };
  };

  const totals = calculateTotals();

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Voucher number validation
    if (!formData.vNo || formData.vNo.trim() === '') {
      errors.vNo = 'Voucher number is required';
    } else if (isNaN(formData.vNo)) {
      errors.vNo = 'Voucher number must be a valid number';
    } else if (vNoError) {
      errors.vNo = vNoError;
    }

    // Account validation
    if (!formData.accountID || formData.accountID.trim() === '') {
      errors.accountID = 'Account selection is required';
    }

    // Detail records validation
    if (detailRecords.length === 0) {
      errors.details = 'At least one advertisement detail is required';
    }

    // Validate each detail record
    detailRecords.forEach((record, index) => {
      if (!record.inserationDate) {
        errors[`detail_${index}_date`] = 'Insertion date is required';
      }
      if (!record.rate || record.rate <= 0) {
        errors[`detail_${index}_rate`] = 'Valid rate is required';
      }
      if (!record.totalSpace || record.totalSpace.trim() === '') {
        errors[`detail_${index}_space`] = 'Total space is required';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save advertisement
  const saveAdvertisement = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix validation errors before saving', 'error');
      return;
    }

    try {
      // Prepare data for API - ensure it matches backend DTO
      const apiData = {
        vNo: parseInt(formData.vNo),
        billNo: formData.billNo || null,
        billDate: formData.billDate ? new Date(formData.billDate) : null,
        roNo: formData.roNo || null,
        roDate: formData.roDate ? new Date(formData.roDate) : null,
        notes: formData.notes || null, // Fixed: changed from Notes to notes
        accountID: parseInt(formData.accountID),
        agencyName: formData.agencyName || null,
        pID: formData.pID || null,
        caption: formData.caption || null,
        frontPageExtra: parseInt(formData.frontPageExtra) || 0,
        backPageExtra: parseInt(formData.backPageExtra) || 0,
        comission: parseInt(formData.comission) || 0,
        createdBy: mode === 'create' ? parseInt(formData.createdBy) : undefined,
        modifyBy: mode === 'edit' ? parseInt(formData.modifyBy) : undefined,
        details: detailRecords.map((record) => ({
          // Fixed: changed from Details to details
          inserationDate: record.inserationDate ? new Date(record.inserationDate) : null,
          color: record.color || null,
          size: record.size || null,
          totalSpace: record.totalSpace || null,
          position: record.position || null,
          rate: parseInt(record.rate) || 0
        }))
      };

      let result;
      if (mode === 'create') {
        result = await createMaster(apiData).unwrap();
      } else {
        result = await updateMaster({ id: master.masterID, ...apiData }).unwrap();
      }

      if (result.success) {
        showSnackbar(result.message || `Advertisement bill ${mode === 'create' ? 'created' : 'updated'} successfully!`, 'success');
        if (onSave) onSave();
      } else {
        showSnackbar(result.message || `Failed to ${mode === 'create' ? 'create' : 'update'} advertisement bill`, 'error');
      }
    } catch (error) {
      console.error('Failed to save advertisement:', error);
      let errorMessage = 'Failed to save advertisement bill. Please try again.';

      if (error.data) {
        if (error.data.message) {
          errorMessage = error.data.message;
        }
        if (error.data.errors && Array.isArray(error.data.errors)) {
          errorMessage += `: ${error.data.errors.join(', ')}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showSnackbar(errorMessage, 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (vNoTimeout) {
        clearTimeout(vNoTimeout);
      }
    };
  }, [vNoTimeout]);

  return (
    <>
      <Paper elevation={2} sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Button startIcon={<BackIcon />} onClick={onCancel} variant="outlined">
            Back to List
          </Button>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {mode === 'create' ? 'Create Advertisement Bill' : `Edit Advertisement Bill - ${formData.billNo || 'V' + formData.vNo}`}
          </Typography>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={saveAdvertisement}
            disabled={loading}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Bill' : 'Update Bill'}
          </Button>
        </Box>

        {/* Basic Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, mb: 3 }}>
              Basic Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Voucher No *"
                  type="number"
                  value={formData.vNo}
                  onChange={(e) => handleInputChange('vNo', e.target.value)}
                  error={!!validationErrors.vNo || !!vNoError}
                  helperText={validationErrors.vNo || vNoError || 'Unique voucher number'}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bill No"
                  value={formData.billNo}
                  onChange={(e) => handleInputChange('billNo', e.target.value)}
                  placeholder="Auto-generated if left empty"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bill Date"
                  type="date"
                  value={formData.billDate}
                  onChange={(e) => handleInputChange('billDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="RO No" value={formData.roNo} onChange={(e) => handleInputChange('roNo', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="RO Date"
                  type="date"
                  value={formData.roDate}
                  onChange={(e) => handleInputChange('roDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="PID" value={formData.pID} onChange={(e) => handleInputChange('pID', e.target.value)} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Account & Agency Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, mb: 3 }}>
              Account & Agency Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={filteredAccountOptions}
                  getOptionLabel={(option) => option.accountTitle || ''}
                  value={selectedAccount}
                  onChange={handleAccountSelect}
                  onInputChange={(event, newInputValue) => {
                    handleAccountSearch(newInputValue);
                  }}
                  loading={accountsLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Account *"
                      error={!!validationErrors.accountID}
                      helperText={validationErrors.accountID || 'Search by account name, contact person, or mobile'}
                      required
                      placeholder="Start typing to search accounts..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {accountsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {option.accountTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.contactPersonName} • {option.contactPersonMobile}
                          {option.city && ` • ${option.city}`}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  noOptionsText={accountsLoading ? 'Loading accounts...' : 'No accounts found. Try typing more characters.'}
                />
                {selectedAccount && (
                  <Box sx={{ mt: 1, p: 1, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>Contact:</strong> {selectedAccount.contactPersonName || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Mobile:</strong> {selectedAccount.contactPersonMobile || 'N/A'}
                    </Typography>
                    {selectedAccount.city && (
                      <Typography variant="body2">
                        <strong>City:</strong> {selectedAccount.city}
                      </Typography>
                    )}
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agency Name"
                  value={formData.agencyName}
                  onChange={(e) => handleInputChange('agencyName', e.target.value)}
                  placeholder="Enter agency name (if applicable)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Advertisement Caption"
                  value={formData.caption}
                  onChange={(e) => handleInputChange('caption', e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Enter advertisement caption or description..."
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Advertisement Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                Advertisement Details
              </Typography>
              <Button startIcon={<AddIcon />} onClick={addDetailRecord} variant="outlined">
                Add Detail
              </Button>
            </Box>

            {validationErrors.details && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationErrors.details}
              </Alert>
            )}

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Insertion Date *</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Color</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Space *</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rate (PKR) *</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount (PKR)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailRecords.map((record, index) => {
                    const spaceValue = parseInt(record.totalSpace) || 0;
                    const rateValue = parseInt(record.rate) || 0;
                    const amount = rateValue * spaceValue;

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            type="date"
                            value={record.inserationDate}
                            onChange={(e) => handleDetailChange(index, 'inserationDate', e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            error={!!validationErrors[`detail_${index}_date`]}
                            helperText={validationErrors[`detail_${index}_date`]}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={record.color}
                            onChange={(e) => handleDetailChange(index, 'color', e.target.value)}
                            size="small"
                            placeholder="Black/White, Color"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={record.size}
                            onChange={(e) => handleDetailChange(index, 'size', e.target.value)}
                            size="small"
                            placeholder="e.g., 10x5"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={record.totalSpace}
                            onChange={(e) => handleDetailChange(index, 'totalSpace', e.target.value)}
                            size="small"
                            error={!!validationErrors[`detail_${index}_space`]}
                            helperText={validationErrors[`detail_${index}_space`]}
                            placeholder="e.g., 50"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select value={record.position} onChange={(e) => handleDetailChange(index, 'position', e.target.value)}>
                              <MenuItem value="F.P.">Front Page</MenuItem>
                              <MenuItem value="B.P.">Back Page</MenuItem>
                              <MenuItem value="Inside">Inside</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={record.rate}
                            onChange={(e) => handleDetailChange(index, 'rate', parseInt(e.target.value) || 0)}
                            size="small"
                            error={!!validationErrors[`detail_${index}_rate`]}
                            helperText={validationErrors[`detail_${index}_rate`]}
                            inputProps={{ min: 0 }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => removeDetailRecord(index)}
                            color="error"
                            size="small"
                            disabled={detailRecords.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, mb: 3 }}>
              Financial Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Front Page Extra %"
                  type="number"
                  value={formData.frontPageExtra}
                  onChange={(e) => handleInputChange('frontPageExtra', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 100 }}
                  helperText="Percentage extra for front page ads"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Back Page Extra %"
                  type="number"
                  value={formData.backPageExtra}
                  onChange={(e) => handleInputChange('backPageExtra', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 100 }}
                  helperText="Percentage extra for back page ads"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Commission Amount (PKR)"
                  type="number"
                  value={formData.comission}
                  onChange={(e) => handleInputChange('comission', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                  helperText="Commission to be deducted"
                />
              </Grid>
            </Grid>

            {/* Totals Display */}
            <Box
              sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                Bill Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Advertisement Amount:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {totals.totalAmount.toLocaleString()} PKR
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Extras Amount:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {totals.extrasAmount.toLocaleString()} PKR
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Gross Total:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {totals.grossTotal.toLocaleString()} PKR
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Net Amount:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {totals.netAmount.toLocaleString()} PKR
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, mb: 3 }}>
              Additional Notes
            </Typography>
            <TextField
              fullWidth
              value={formData.notes} // Fixed: changed from Notes to notes
              onChange={(e) => handleInputChange('notes', e.target.value)} // Fixed: changed from Notes to notes
              multiline
              rows={3}
              placeholder="Enter any additional notes, comments, or special instructions..."
              helperText="Optional notes for internal reference"
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button variant="outlined" onClick={onCancel} disabled={loading} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={saveAdvertisement}
            disabled={loading}
            sx={{ minWidth: 140 }}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Bill' : 'Update Bill'}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdvertisementForm;
