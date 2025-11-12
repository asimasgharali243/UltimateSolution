import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Button,
  Checkbox,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  MenuItem,
  Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save as SaveIcon, Refresh as RefreshIcon, Security as SecurityIcon, Person as PersonIcon } from '@mui/icons-material';

import { useGetUsersQuery, useGetFormsQuery, useGetUserRightsQuery, useSaveUserRightsMutation } from '../../../store/api/userRightsApi';

const UserRightsForm = () => {
  const theme = useTheme();

  // State management
  const [selectedUser, setSelectedUser] = useState('');
  const [userRights, setUserRights] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // API hooks
  const { data: users = [], isLoading: usersLoading, error: usersError } = useGetUsersQuery();
  const { data: forms = [], isLoading: formsLoading, error: formsError } = useGetFormsQuery();
  const {
    data: existingRights = [],
    isLoading: rightsLoading,
    error: rightsError,
    refetch: refetchRights
  } = useGetUserRightsQuery(selectedUser, {
    skip: !selectedUser
  });

  console.log('🔍 DEBUG - Existing Rights:', existingRights);
  console.log('🔍 DEBUG - Forms:', forms);

  const [saveUserRights, { isLoading: saving }] = useSaveUserRightsMutation();

  // Show snackbar message
  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Initialize user rights when forms load
  useEffect(() => {
    if (forms.length > 0 && !selectedUser) {
      initializeUserRights();
    }
  }, [forms, selectedUser]);

  // Update user rights when existing rights are loaded - FIXED VERSION
  useEffect(() => {
    if (existingRights.length > 0 && selectedUser && forms.length > 0) {
      console.log('🔍 DEBUG - Mapping existing rights to forms');

      const updatedRights = forms.map((form) => {
        const existingRight = existingRights.find((ur) => ur.formID === form.formID);

        if (existingRight) {
          console.log(`🔍 DEBUG - Found existing right for form ${form.formDisplayName}:`, existingRight);

          // IMPORTANT: Use the EXACT property names from the API response
          return {
            id: existingRight.id,
            UserID: parseInt(selectedUser),
            FormID: form.formID,
            formName: form.formDisplayName,
            // Use camelCase as it comes from the API
            CanView: existingRight.canView || false,
            CanSave: existingRight.canSave || false,
            CanUpdate: existingRight.canUpdate || false,
            CanDelete: existingRight.canDelete || false,
            CanPost: existingRight.canPost || false
          };
        } else {
          console.log(`🔍 DEBUG - No existing right for form ${form.formDisplayName}`);
          return {
            id: null,
            UserID: parseInt(selectedUser),
            FormID: form.formID,
            formName: form.formDisplayName,
            CanView: false,
            CanSave: false,
            CanUpdate: false,
            CanDelete: false,
            CanPost: false
          };
        }
      });

      console.log('🔍 DEBUG - Final mapped rights:', updatedRights);
      setUserRights(updatedRights);
    } else if (selectedUser && forms.length > 0 && existingRights.length === 0) {
      // User has no existing rights, initialize all as false
      console.log('🔍 DEBUG - User has no existing rights, initializing all as false');
      initializeUserRights();
    }
  }, [existingRights, forms, selectedUser]);

  // Initialize user rights structure
  const initializeUserRights = () => {
    const initialRights = forms.map((form) => ({
      id: null,
      UserID: selectedUser ? parseInt(selectedUser) : null,
      FormID: form.formID,
      formName: form.formDisplayName,
      CanView: false,
      CanSave: false,
      CanUpdate: false,
      CanDelete: false,
      CanPost: false
    }));
    console.log('🔍 DEBUG - Initialized rights:', initialRights);
    setUserRights(initialRights);
  };

  // Handle user selection
  const handleUserChange = (event) => {
    const userId = event.target.value;
    console.log('🔍 DEBUG - User selected:', userId);
    setSelectedUser(userId);

    if (!userId) {
      initializeUserRights();
    }
  };

  // Handle permission change
  const handlePermissionChange = (formID, permission, value) => {
    console.log(`🔍 DEBUG - Permission change: Form ${formID}, ${permission} = ${value}`);
    setUserRights((prev) => prev.map((right) => (right.FormID === formID ? { ...right, [permission]: value } : right)));
  };

  // Handle select all for a form (ENTIRE ROW)
  const handleSelectAllRow = (formID, value) => {
    console.log(`🔍 DEBUG - Select all ROW for form ${formID}: ${value}`);
    setUserRights((prev) =>
      prev.map((right) =>
        right.FormID === formID
          ? {
              ...right,
              CanView: value,
              CanSave: value,
              CanUpdate: value,
              CanDelete: value,
              CanPost: value
            }
          : right
      )
    );
  };

  // Handle select all for a column (ENTIRE COLUMN)
  const handleSelectAllColumn = (permission, value) => {
    console.log(`🔍 DEBUG - Select all COLUMN for ${permission}: ${value}`);
    setUserRights((prev) =>
      prev.map((right) => ({
        ...right,
        [permission]: value
      }))
    );
  };

  // Save user rights - FIXED VERSION
  const handleSaveUserRights = async () => {
    if (!selectedUser) {
      showMessage('Please select a user first', 'error');
      return;
    }

    try {
      console.log('🔍 DEBUG - Current user rights before save:', userRights);

      // Prepare data for API - use camelCase for backend
      const rightsToSave = userRights.map((right) => ({
        UserID: parseInt(selectedUser),
        FormID: right.FormID,
        // Use camelCase for API
        canView: right.CanView || false,
        canSave: right.CanSave || false,
        canUpdate: right.CanUpdate || false,
        canDelete: right.CanDelete || false,
        canPost: right.CanPost || false
      }));

      console.log('🔍 DEBUG - Rights to save:', rightsToSave);

      // Check if any permissions are selected
      const hasAnyPermissions = rightsToSave.some(
        (right) => right.canView || right.canSave || right.canUpdate || right.canDelete || right.canPost
      );

      if (!hasAnyPermissions) {
        showMessage('No permissions selected to save', 'warning');
        return;
      }

      const result = await saveUserRights({ userRights: rightsToSave }).unwrap();

      showMessage(result.message || 'User rights saved successfully!');

      // Refetch rights to get updated data
      refetchRights();
    } catch (error) {
      console.error('Failed to save user rights:', error);
      showMessage(error.data?.message || error.error || 'Failed to save user rights', 'error');
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedUser('');
    initializeUserRights();
  };

  // Check if all permissions are selected for a form (for row checkbox)
  const areAllSelectedInRow = (formID) => {
    const right = userRights.find((r) => r.FormID === formID);
    const allSelected = right && right.CanView && right.CanSave && right.CanUpdate && right.CanDelete && right.CanPost;
    console.log(`🔍 DEBUG - All selected in ROW for form ${formID}: ${allSelected}`);
    return allSelected;
  };

  // Check if any permission is selected for a form (for row checkbox indeterminate state)
  const isAnySelectedInRow = (formID) => {
    const right = userRights.find((r) => r.FormID === formID);
    const anySelected = right && (right.CanView || right.CanSave || right.CanUpdate || right.CanDelete || right.CanPost);
    console.log(`🔍 DEBUG - Any selected in ROW for form ${formID}: ${anySelected}`);
    return anySelected;
  };

  // Check if all permissions are selected for a column (for column header checkbox)
  const areAllSelectedInColumn = (permission) => {
    if (userRights.length === 0) return false;
    const allSelected = userRights.every((right) => right[permission]);
    console.log(`🔍 DEBUG - All selected in COLUMN for ${permission}: ${allSelected}`);
    return allSelected;
  };

  // Check if any permission is selected for a column (for column header checkbox indeterminate state)
  const isAnySelectedInColumn = (permission) => {
    if (userRights.length === 0) return false;
    const anySelected = userRights.some((right) => right[permission]);
    console.log(`🔍 DEBUG - Any selected in COLUMN for ${permission}: ${anySelected}`);
    return anySelected;
  };

  const loading = usersLoading || formsLoading || rightsLoading;
  const error = usersError || formsError || rightsError;

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading data: {error?.data?.message || error?.error || 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <SecurityIcon sx={{ fontSize: 'inherit' }} />
          User Rights Management
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Reset Form">
            <IconButton color="secondary" onClick={handleReset} sx={{ border: `1px solid ${theme.palette.secondary.main}` }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveUserRights}
            disabled={saving || !selectedUser}
            sx={{
              borderRadius: 2,
              px: 3,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            {saving ? 'Saving...' : 'Save Rights'}
          </Button>
        </Box>
      </Box>

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
        {/* User Selection Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              <PersonIcon sx={{ fontSize: 20 }} />
              Select User
            </Typography>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" disabled={usersLoading}>
                  <InputLabel>Select User</InputLabel>
                  <Select value={selectedUser} label="Select User" onChange={handleUserChange} variant="outlined">
                    <MenuItem value="">
                      <em>Select a user</em>
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.userID} value={user.userID}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {user.userFullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.userName}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                {selectedUser && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: theme.palette.grey[50], borderRadius: 1 }}>
                    <PersonIcon color="primary" />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {users.find((u) => u.userID == selectedUser)?.userFullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        User ID: {selectedUser}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* User Rights Table */}
        <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                User Permissions
              </Typography>

              {selectedUser && (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Editing rights for: {users.find((u) => u.userID == selectedUser)?.userFullName}
                </Typography>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer
                sx={{
                  maxWidth: '100%',
                  overflowX: 'auto',
                  borderRadius: 1,
                  '& .MuiTableCell-root': {
                    padding: '12px 16px'
                  }
                }}
              >
                <Table size="small" sx={{ minWidth: 800 }}>
                  <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap', minWidth: '200px' }}>Form Name</TableCell>

                      {/* Select All Row Header */}
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap', textAlign: 'center', minWidth: '120px' }}>
                        Select Row
                      </TableCell>

                      {/* Column Headers with Select All Checkboxes */}
                      {[
                        { key: 'CanView', label: 'View' },
                        { key: 'CanSave', label: 'Save' },
                        { key: 'CanUpdate', label: 'Update' },
                        { key: 'CanDelete', label: 'Delete' },
                        { key: 'CanPost', label: 'Post' }
                      ].map(({ key, label }) => (
                        <TableCell
                          key={key}
                          sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap', textAlign: 'center', minWidth: '100px' }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {label}
                            </Typography>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  checked={areAllSelectedInColumn(key)}
                                  indeterminate={isAnySelectedInColumn(key) && !areAllSelectedInColumn(key)}
                                  onChange={(e) => handleSelectAllColumn(key, e.target.checked)}
                                  color="default"
                                  sx={{
                                    color: 'white',
                                    '&.Mui-checked': {
                                      color: 'white'
                                    }
                                  }}
                                  disabled={!selectedUser}
                                />
                              }
                              label=""
                              sx={{ margin: 0 }}
                            />
                            <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                              Select All
                            </Typography>
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userRights.map((right) => (
                      <TableRow
                        key={right.FormID}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                          '&:hover': { backgroundColor: theme.palette.action.selected }
                        }}
                      >
                        {/* Form Name */}
                        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>{right.formName}</TableCell>

                        {/* Select All Row Checkbox */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={areAllSelectedInRow(right.FormID)}
                                  indeterminate={isAnySelectedInRow(right.FormID) && !areAllSelectedInRow(right.FormID)}
                                  onChange={(e) => handleSelectAllRow(right.FormID, e.target.checked)}
                                  color="primary"
                                  disabled={!selectedUser}
                                />
                              }
                              label=""
                            />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                              All
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Individual Permissions with Switches */}
                        {['CanView', 'CanSave', 'CanUpdate', 'CanDelete', 'CanPost'].map((permission) => (
                          <TableCell key={permission} sx={{ textAlign: 'center' }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={right[permission] || false}
                                  onChange={(e) => handlePermissionChange(right.FormID, permission, e.target.checked)}
                                  color="primary"
                                  disabled={!selectedUser}
                                />
                              }
                              label=""
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Instructions */}
            {!selectedUser && !loading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Please select a user from the dropdown above to manage their permissions.
              </Alert>
            )}

            {selectedUser && userRights.length === 0 && !loading && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No forms available or user has no existing permissions.
              </Alert>
            )}

            {/* Usage Instructions */}
            {selectedUser && userRights.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  How to use:
                </Typography>
                <Typography variant="body2">
                  • <strong>Select Row:</strong> Checkbox to select all permissions for a specific form
                </Typography>
                <Typography variant="body2">
                  • <strong>Select Column:</strong> Checkbox in column headers to select that permission for all forms
                </Typography>
                <Typography variant="body2">
                  • <strong>Individual:</strong> Use switches for specific form permissions
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Paper>

      {/* Snackbar for messages */}
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
    </Box>
  );
};

export default UserRightsForm;
