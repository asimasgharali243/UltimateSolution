import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useCreateAccountMutation, useUpdateAccountMutation, useCheckAccountTitleExistsQuery } from '../../../store/api/accountApi';
import { useSelector } from 'react-redux';

const AccountForm = ({ mode, account, onSave, onCancel, onRefetch }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useSelector((state) => state.auth);

  // RTK Query mutations
  const [createAccount, { isLoading: creating }] = useCreateAccountMutation();
  const [updateAccount, { isLoading: updating }] = useUpdateAccountMutation();

  const loading = creating || updating;

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Title options for salutation
  const titleOptions = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.', 'Engr.', 'Sir', 'Madam'];

  // Account type options
  const accountTypeOptions = ['Client', 'Vendor', 'Supplier', 'Customer', 'Partner', 'Other'];

  // Initial form state
  const initialFormState = {
    accountType: 'Client',
    accountTitle: '',
    city: '',
    address: '',
    title: '',
    contactPersonName: '',
    contactPersonMobile: '',
    contactPersonWhatsapp: '',
    contactPersonEmail: '',
    creditLimit: 0,
    creditDays: 0,
    cnic: '',
    ntn: '',
    stn: '',
    openingBalance: 0,
    notes: '',
    openingBalanceDate: new Date().toISOString().split('T')[0],
    createdBy: user?.userID || 0,
    modifyBy: user?.userID || 0,
    LID4: null
  };

  const [formData, setFormData] = useState(initialFormState);
  const [validationErrors, setValidationErrors] = useState({});

  // Check if account title exists (for create mode)
  const { data: titleCheckData, refetch: checkTitle } = useCheckAccountTitleExistsQuery(formData.accountTitle, {
    skip: !formData.accountTitle || mode === 'edit'
  });

  // Initialize form data when mode changes - FIXED: Use useCallback to prevent unnecessary re-renders
  useEffect(() => {
    if (mode === 'edit' && account) {
      setFormData({
        accountType: account.accountType || 'Client',
        accountTitle: account.accountTitle || '',
        city: account.city || '',
        address: account.address || '',
        title: account.title || '',
        contactPersonName: account.contactPersonName || '',
        contactPersonMobile: account.contactPersonMobile || '',
        contactPersonWhatsapp: account.contactPersonWhatsapp || '',
        contactPersonEmail: account.contactPersonEmail || '',
        creditLimit: account.creditLimit || 0,
        creditDays: account.creditDays || 0,
        cnic: account.cnic || '',
        ntn: account.ntn || '',
        stn: account.stn || '',
        openingBalance: account.openingBalance || 0,
        notes: account.notes || '',
        openingBalanceDate: account.openingBalanceDate
          ? new Date(account.openingBalanceDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        createdBy: account.createdBy || user?.userID || 0,
        modifyBy: user?.userID || 0,
        LID4: account.LID4 || null
      });
    } else if (mode === 'create') {
      setFormData({
        ...initialFormState,
        createdBy: user?.userID || 0,
        modifyBy: user?.userID || 0
      });
    }
  }, [mode, account, user]);

  // Check for duplicate title when accountTitle changes
  useEffect(() => {
    if (formData.accountTitle && mode === 'create') {
      const timeoutId = setTimeout(() => {
        checkTitle();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.accountTitle, mode, checkTitle]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // FIXED: Use useCallback to prevent re-creation of function on every render
  const handleInputChange = React.useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value
      }));

      // Clear validation error when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: ''
        }));
      }
    },
    [validationErrors]
  );

  // FIXED: Memoize tab change handler
  const handleTabChange = React.useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!formData.accountTitle.trim()) {
      errors.accountTitle = 'Account title is required';
    } else if (titleCheckData?.exists && mode === 'create') {
      errors.accountTitle = 'Account title already exists';
    }

    if (!formData.contactPersonName.trim()) {
      errors.contactPersonName = 'Contact person name is required';
    }

    if (!formData.contactPersonMobile.trim()) {
      errors.contactPersonMobile = 'Mobile number is required';
    }

    if (formData.contactPersonEmail && !/\S+@\S+\.\S+/.test(formData.contactPersonEmail)) {
      errors.contactPersonEmail = 'Invalid email address';
    }

    if (formData.creditLimit < 0) {
      errors.creditLimit = 'Credit limit must be a positive number';
    }

    if (formData.creditDays < 0) {
      errors.creditDays = 'Credit days must be a positive number';
    }

    if (formData.openingBalance < 0) {
      errors.openingBalance = 'Opening balance must be a positive number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveAccount = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the validation errors', 'error');
      return;
    }

    try {
      // Prepare data for API
      const apiData = {
        accountType: formData.accountType,
        accountTitle: formData.accountTitle.trim(),
        city: formData.city || null,
        address: formData.address || null,
        title: formData.title || null,
        contactPersonName: formData.contactPersonName.trim(),
        contactPersonMobile: formData.contactPersonMobile.trim(),
        contactPersonWhatsapp: formData.contactPersonWhatsapp || null,
        contactPersonEmail: formData.contactPersonEmail || null,
        creditLimit: formData.creditLimit,
        creditDays: formData.creditDays,
        cnic: formData.cnic || null,
        ntn: formData.ntn || null,
        stn: formData.stn || null,
        openingBalance: formData.openingBalance,
        notes: formData.notes || null,
        openingBalanceDate: formData.openingBalanceDate || null,
        LID4: formData.LID4 || null
      };

      // Add user IDs
      if (mode === 'create') {
        apiData.createdBy = user?.userID || 0;
      } else {
        apiData.modifyBy = user?.userID || 0;
      }

      let result;
      if (mode === 'create') {
        result = await createAccount(apiData).unwrap();
      } else {
        result = await updateAccount({ id: account.accountID, ...apiData }).unwrap();
      }

      if (result.success) {
        showSnackbar(result.message || (mode === 'create' ? 'Account created successfully!' : 'Account updated successfully!'), 'success');

        if (onRefetch) onRefetch();
        if (onCancel) onCancel();
      } else {
        showSnackbar(result.message || 'Failed to save account', 'error');
      }
    } catch (error) {
      console.error('Failed to save account:', error);

      // Handle different error formats
      let errorMessage = 'Failed to save account. Please try again.';

      if (error.data) {
        // RTK Query error format
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

  // FIXED: Memoize TabPanel component to prevent re-renders
  const TabPanel = React.useMemo(() => {
    return ({ children, value, index, ...other }) => (
      <div role="tabpanel" hidden={value !== index} id={`account-tabpanel-${index}`} aria-labelledby={`account-tab-${index}`} {...other}>
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
      </div>
    );
  }, []);

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          overflow: 'hidden',
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        {/* Header Actions */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Button startIcon={<BackIcon />} onClick={onCancel} variant="outlined">
            Back to List
          </Button>
          <Typography variant="h4" fontWeight="bold" color="primary" sx={{ textAlign: 'center', flex: 1 }}>
            {mode === 'create' ? 'Create New Account' : `Edit Account - ${formData.accountTitle}`}
          </Typography>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={saveAccount}
            disabled={loading}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Account' : 'Update Account'}
          </Button>
        </Box>

        {/* Customer Information Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, mb: 3 }}>
              Account Information
            </Typography>

            <Grid container spacing={3}>
              {/* Row 1: Equal columns */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bussiness Name *"
                  value={formData.accountTitle}
                  onChange={(e) => handleInputChange('accountTitle', e.target.value)}
                  size="small"
                  variant="outlined"
                  required
                  placeholder="Enter Bussiness Name"
                  error={!!validationErrors.accountTitle}
                  helperText={validationErrors.accountTitle}
                />
              </Grid>

              {/* Row 2: Equal columns - FIXED LAYOUT */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Title</InputLabel>
                  <Select value={formData.title} label="Title" onChange={(e) => handleInputChange('title', e.target.value)}>
                    <MenuItem value="">None</MenuItem>
                    {titleOptions.map((title) => (
                      <MenuItem key={title} value={title}>
                        {title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Contact Person Name *"
                  value={formData.contactPersonName}
                  onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                  size="small"
                  variant="outlined"
                  required
                  placeholder="Enter contact person name"
                  error={!!validationErrors.contactPersonName}
                  helperText={validationErrors.contactPersonName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Account Type *</InputLabel>
                  <Select
                    value={formData.accountType}
                    label="Account Type *"
                    onChange={(e) => handleInputChange('accountType', e.target.value)}
                  >
                    {accountTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Row 3: Equal columns */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Mobile Number *"
                  value={formData.contactPersonMobile}
                  onChange={(e) => handleInputChange('contactPersonMobile', e.target.value)}
                  size="small"
                  variant="outlined"
                  required
                  placeholder="0300-1234567"
                  error={!!validationErrors.contactPersonMobile}
                  helperText={validationErrors.contactPersonMobile}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="WhatsApp Number"
                  value={formData.contactPersonWhatsapp}
                  onChange={(e) => handleInputChange('contactPersonWhatsapp', e.target.value)}
                  size="small"
                  variant="outlined"
                  placeholder="0300-1234567"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={formData.contactPersonEmail}
                  onChange={(e) => handleInputChange('contactPersonEmail', e.target.value)}
                  size="small"
                  variant="outlined"
                  type="email"
                  placeholder="contact@company.com"
                  error={!!validationErrors.contactPersonEmail}
                  helperText={validationErrors.contactPersonEmail}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 3,
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.875rem'
                }
              }}
            >
              <Tab label="Address" />
              <Tab label="Tax Info" />
              <Tab label="Terms" />
              <Tab label="Notes" />
            </Tabs>

            {/* Address Tab - FIXED: Equal columns */}
            <TabPanel value={activeTab} index={0}>
              {/* Row 1: Billing Address */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600">
                    Billing Address
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    size="small"
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Enter complete billing address"
                  />
                </Grid>
              </Grid>

              {/* Row 2: City */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600">
                    City
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    size="small"
                    variant="outlined"
                    placeholder="Enter city name"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tax Info Tab - FIXED: Equal columns */}
            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600" color="primary">
                    Tax Identification Numbers
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="CNIC"
                    value={formData.cnic}
                    onChange={(e) => handleInputChange('cnic', e.target.value)}
                    size="small"
                    variant="outlined"
                    placeholder="12345-6789012-3"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="NTN"
                    value={formData.ntn}
                    onChange={(e) => handleInputChange('ntn', e.target.value)}
                    size="small"
                    variant="outlined"
                    placeholder="National Tax Number"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="STN"
                    value={formData.stn}
                    onChange={(e) => handleInputChange('stn', e.target.value)}
                    size="small"
                    variant="outlined"
                    placeholder="Sales Tax Number"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Terms Tab - FIXED: Equal columns */}
            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600" color="primary">
                    Financial Terms
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Credit Days"
                    type="number"
                    value={formData.creditDays}
                    onChange={(e) => handleInputChange('creditDays', parseInt(e.target.value) || 0)}
                    size="small"
                    variant="outlined"
                    inputProps={{ min: 0 }}
                    error={!!validationErrors.creditDays}
                    helperText={validationErrors.creditDays || 'Number of days for credit payment'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Credit Limit (PKR)"
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => handleInputChange('creditLimit', parseFloat(e.target.value) || 0)}
                    size="small"
                    variant="outlined"
                    inputProps={{ min: 0 }}
                    error={!!validationErrors.creditLimit}
                    helperText={validationErrors.creditLimit || 'Maximum credit amount allowed'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Opening Balance Date"
                    type="date"
                    value={formData.openingBalanceDate}
                    onChange={(e) => handleInputChange('openingBalanceDate', e.target.value)}
                    size="small"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Opening Balance (PKR)"
                    type="number"
                    value={formData.openingBalance}
                    onChange={(e) => handleInputChange('openingBalance', parseFloat(e.target.value) || 0)}
                    size="small"
                    variant="outlined"
                    inputProps={{ min: 0 }}
                    error={!!validationErrors.openingBalance}
                    helperText={validationErrors.openingBalance || 'Initial account balance'}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Notes Tab */}
            <TabPanel value={activeTab} index={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600" color="primary">
                    Additional Notes
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    size="small"
                    variant="outlined"
                    multiline
                    rows={8}
                    placeholder="Enter any additional notes, comments, or special instructions..."
                    inputProps={{ maxLength: 500 }}
                    helperText={`${formData.notes?.length || 0}/500 characters`}
                  />
                </Grid>
              </Grid>
            </TabPanel>
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
            onClick={saveAccount}
            disabled={loading}
            sx={{ minWidth: 140 }}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Account' : 'Update Account'}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
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

export default React.memo(AccountForm);
