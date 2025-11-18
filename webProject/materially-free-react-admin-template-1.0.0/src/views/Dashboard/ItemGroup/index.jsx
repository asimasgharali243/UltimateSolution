// src/views/Dashboard/ItemGroup/ItemGroupManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  FormHelperText,
  Collapse
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import {
  useGetItemGroupsQuery,
  useCreateItemGroupMutation,
  useUpdateItemGroupMutation,
  useDeleteItemGroupMutation,
  useLazyCheckGroupCodeExistsQuery
} from '../../../store/api/itemGroupApi';

const ItemGroupManagement = () => {
  const theme = useTheme();
  const currentUser = useSelector((state) => state.auth.user);
  console.log('Current User:', currentUser); // Debug log
  // RTK Query hooks
  const {
    data: itemGroupsResponse,
    isLoading: itemGroupsLoading,
    error: itemGroupsError,
    refetch: refetchItemGroups
  } = useGetItemGroupsQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  const [createItemGroup, { isLoading: creatingItemGroup }] = useCreateItemGroupMutation();
  const [updateItemGroup, { isLoading: updatingItemGroup }] = useUpdateItemGroupMutation();
  const [deleteItemGroup, { isLoading: deletingItemGroup }] = useDeleteItemGroupMutation();
  const [checkGroupCodeExists] = useLazyCheckGroupCodeExistsQuery();

  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItemGroup, setEditingItemGroup] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [createFormOpen, setCreateFormOpen] = useState(false);

  // New item group form state
  const [newItemGroup, setNewItemGroup] = useState({
    groupCode: '',
    groupName: '',
    active: true
  });

  const itemGroups = itemGroupsResponse?.data || [];

  // Filtered and paginated data
  const filteredItemGroups = useMemo(() => {
    return itemGroups.filter((itemGroup) => {
      const matchesSearch =
        itemGroup.groupCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itemGroup.groupName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [itemGroups, searchTerm]);

  const paginatedItemGroups = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredItemGroups.slice(start, start + rowsPerPage);
  }, [filteredItemGroups, page, rowsPerPage]);

  // Combined loading state
  const loading = itemGroupsLoading || creatingItemGroup || updatingItemGroup || deletingItemGroup;

  // Handle errors
  useEffect(() => {
    if (itemGroupsError) {
      setMessage({
        type: 'error',
        text: itemGroupsError.data?.message || itemGroupsError.error || 'Failed to load item groups'
      });
    }
  }, [itemGroupsError]);

  // Handle input changes for new item group
  const handleNewItemGroupChange = useCallback(
    (field, value) => {
      setNewItemGroup((prev) => ({
        ...prev,
        [field]: value
      }));

      // Clear field error when user types
      if (formErrors[field]) {
        setFormErrors((prev) => ({
          ...prev,
          [field]: ''
        }));
      }
    },
    [formErrors]
  );

  // Handle input changes for editing item group
  const handleEditItemGroupChange = useCallback(
    (field, value) => {
      setEditingItemGroup((prev) => ({
        ...prev,
        [field]: value
      }));

      // Clear field error when user types
      if (formErrors[field]) {
        setFormErrors((prev) => ({
          ...prev,
          [field]: ''
        }));
      }
    },
    [formErrors]
  );

  // Mark field as touched
  const handleFieldTouch = (field) => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true
    }));
  };

  // Check if group code already exists
  const validateGroupCode = async (groupCode, excludeId = null) => {
    const trimmedCode = groupCode.trim();

    if (!trimmedCode) return false; // Empty is invalid

    try {
      setIsCheckingCode(true);
      const result = await checkGroupCodeExists({ groupCode: trimmedCode, excludeId }).unwrap();
      return !result.exists; // Returns true if code doesn't exist (valid)
    } catch (error) {
      console.error('Error checking group code:', error);
      return false; // Assume invalid if check fails
    } finally {
      setIsCheckingCode(false);
    }
  };

  // Real-time validation for group code
  const handleGroupCodeBlur = async (value, isEdit = false, groupID = null) => {
    const trimmedValue = value.trim();
    handleFieldTouch('groupCode');

    if (!trimmedValue) {
      setFormErrors((prev) => ({ ...prev, groupCode: 'Group code is required' }));
      return;
    }

    if (trimmedValue.length < 2) {
      setFormErrors((prev) => ({ ...prev, groupCode: 'Group code must be at least 2 characters' }));
      return;
    }

    if (trimmedValue.length > 50) {
      setFormErrors((prev) => ({ ...prev, groupCode: 'Group code must be less than 50 characters' }));
      return;
    }

    // Check if code exists
    const isValidCode = await validateGroupCode(trimmedValue, isEdit ? groupID : null);
    if (!isValidCode) {
      setFormErrors((prev) => ({ ...prev, groupCode: 'Group code already exists' }));
    } else {
      setFormErrors((prev) => ({ ...prev, groupCode: '' }));
    }
  };

  // Real-time validation for group name
  const handleGroupNameBlur = (value) => {
    const trimmedValue = value.trim();
    handleFieldTouch('groupName');

    if (!trimmedValue) {
      setFormErrors((prev) => ({ ...prev, groupName: 'Group name is required' }));
      return;
    }

    if (trimmedValue.length < 2) {
      setFormErrors((prev) => ({ ...prev, groupName: 'Group name must be at least 2 characters' }));
      return;
    }

    if (trimmedValue.length > 50) {
      setFormErrors((prev) => ({ ...prev, groupName: 'Group name must be less than 50 characters' }));
      return;
    }

    setFormErrors((prev) => ({ ...prev, groupName: '' }));
  };

  // Validate form before submission
  const validateForm = async (formData, isEdit = false) => {
    const errors = {};

    // Group Code validation
    if (!formData.groupCode?.trim()) {
      errors.groupCode = 'Group code is required';
    } else if (formData.groupCode.trim().length < 2) {
      errors.groupCode = 'Group code must be at least 2 characters';
    } else if (formData.groupCode.trim().length > 50) {
      errors.groupCode = 'Group code must be less than 50 characters';
    } else {
      // Check if group code exists (only for create or when code changes in edit)
      if (!isEdit || (isEdit && formData.groupCode !== itemGroups.find((g) => g.groupID === formData.groupID)?.groupCode)) {
        const isValidCode = await validateGroupCode(formData.groupCode, isEdit ? formData.groupID : null);
        if (!isValidCode) {
          errors.groupCode = 'Group code already exists';
        }
      }
    }

    // Group Name validation
    if (!formData.groupName?.trim()) {
      errors.groupName = 'Group name is required';
    } else if (formData.groupName.trim().length < 2) {
      errors.groupName = 'Group name must be at least 2 characters';
    } else if (formData.groupName.trim().length > 50) {
      errors.groupName = 'Group name must be less than 50 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open create form
  const openCreateForm = () => {
    setCreateFormOpen(true);
    setNewItemGroup({
      groupCode: '',
      groupName: '',
      active: true
    });
    setFormErrors({});
    setTouchedFields({});
  };

  // Close create form
  const closeCreateForm = () => {
    setCreateFormOpen(false);
    setNewItemGroup({
      groupCode: '',
      groupName: '',
      active: true
    });
    setFormErrors({});
    setTouchedFields({});
  };

  // Open edit dialog
  const openEditDialog = (itemGroup) => {
    setEditingItemGroup({
      groupID: itemGroup.groupID,
      groupCode: itemGroup.groupCode || '',
      groupName: itemGroup.groupName || '',
      active: itemGroup.active !== undefined ? itemGroup.active : true
    });
    setFormErrors({});
    setTouchedFields({});
    setDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItemGroup(null);
    setFormErrors({});
    setTouchedFields({});
  };

  // Create new item group
  const handleCreateItemGroup = async () => {
    try {
      const formData = {
        groupCode: (newItemGroup.groupCode || '').trim(),
        groupName: (newItemGroup.groupName || '').trim(),
        active: newItemGroup.active,
        createdBy: currentUser?.userID || 0
      };

      console.log('Sending data to backend:', formData); // Debug log

      // Validate all fields before submission
      setTouchedFields({ groupCode: true, groupName: true });
      const isValid = await validateForm(formData, false);
      if (!isValid) {
        setMessage({ type: 'error', text: 'Please fix the validation errors before submitting.' });
        return;
      }

      await createItemGroup(formData).unwrap();

      // Reset form and close create form
      setNewItemGroup({
        groupCode: '',
        groupName: '',
        active: true
      });

      setCreateFormOpen(false);
      setMessage({ type: 'success', text: 'Item group created successfully!' });
      refetchItemGroups();
    } catch (error) {
      console.error('Create item group error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to create item group';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Update item group
  const handleUpdateItemGroup = async () => {
    try {
      const formData = {
        groupCode: (editingItemGroup.groupCode || '').trim(),
        groupName: (editingItemGroup.groupName || '').trim(),
        active: editingItemGroup.active,
        modifyBy: currentUser?.userID || 0
      };

      console.log('Sending update data to backend:', formData); // Debug log

      // Validate all fields before submission
      setTouchedFields({ groupCode: true, groupName: true });
      const isValid = await validateForm({ ...formData, groupID: editingItemGroup.groupID }, true);
      if (!isValid) {
        setMessage({ type: 'error', text: 'Please fix the validation errors before submitting.' });
        return;
      }

      await updateItemGroup({
        id: editingItemGroup.groupID,
        ...formData
      }).unwrap();

      setDialogOpen(false);
      setEditingItemGroup(null);
      setMessage({ type: 'success', text: 'Item group updated successfully!' });
      refetchItemGroups();
    } catch (error) {
      console.error('Update item group error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to update item group';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Delete item group
  const handleDeleteItemGroup = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item group?')) {
      return;
    }

    try {
      await deleteItemGroup(id).unwrap();
      setMessage({ type: 'success', text: 'Item group deleted successfully!' });
      refetchItemGroups();
    } catch (error) {
      console.error('Delete item group error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to delete item group';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // Check if form is valid for submission
  const isCreateFormValid = useMemo(() => {
    const hasGroupCode = newItemGroup.groupCode?.trim().length >= 2 && newItemGroup.groupCode.trim().length <= 50;
    const hasGroupName = newItemGroup.groupName?.trim().length >= 2 && newItemGroup.groupName.trim().length <= 50;
    const noErrors = !formErrors.groupCode && !formErrors.groupName;
    const notChecking = !isCheckingCode;

    return hasGroupCode && hasGroupName && noErrors && notChecking;
  }, [newItemGroup, formErrors, isCheckingCode]);

  const isEditFormValid = useMemo(() => {
    if (!editingItemGroup) return false;
    const hasGroupCode = editingItemGroup.groupCode?.trim().length >= 2 && editingItemGroup.groupCode.trim().length <= 50;
    const hasGroupName = editingItemGroup.groupName?.trim().length >= 2 && editingItemGroup.groupName.trim().length <= 50;
    const noErrors = !formErrors.groupCode && !formErrors.groupName;
    const notChecking = !isCheckingCode;

    return hasGroupCode && hasGroupName && noErrors && notChecking;
  }, [editingItemGroup, formErrors, isCheckingCode]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Header with Actions */}
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
          <CategoryIcon sx={{ fontSize: 'inherit' }} />
          ITEM GROUP MANAGEMENT
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Refresh Groups">
            <IconButton
              color="primary"
              sx={{ border: `1px solid ${theme.palette.primary.main}` }}
              onClick={refetchItemGroups}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={createFormOpen ? <ExpandLessIcon /> : <AddIcon />}
            onClick={createFormOpen ? closeCreateForm : openCreateForm}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3
            }}
          >
            {createFormOpen ? 'Cancel Create' : 'Add Group'}
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
        {/* Message Alert */}
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </Alert>
        )}

        {/* Create Form - Above the table */}
        <Collapse in={createFormOpen}>
          <Card sx={{ mb: 3, border: `2px solid ${theme.palette.primary.light}`, background: theme.palette.primary.light + '08' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddIcon />
                Create New Item Group
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Group Code"
                    value={newItemGroup.groupCode}
                    onChange={(e) => handleNewItemGroupChange('groupCode', e.target.value)}
                    onBlur={(e) => handleGroupCodeBlur(e.target.value, false)}
                    placeholder="Enter unique group code"
                    required
                    error={!!formErrors.groupCode && touchedFields.groupCode}
                    helperText={formErrors.groupCode && touchedFields.groupCode ? formErrors.groupCode : ''}
                    disabled={isCheckingCode}
                    size="small"
                    InputProps={{
                      endAdornment: isCheckingCode ? <CircularProgress size={20} /> : null
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Group Name"
                    value={newItemGroup.groupName}
                    onChange={(e) => handleNewItemGroupChange('groupName', e.target.value)}
                    onBlur={(e) => handleGroupNameBlur(e.target.value)}
                    placeholder="Enter group name"
                    required
                    error={!!formErrors.groupName && touchedFields.groupName}
                    helperText={formErrors.groupName && touchedFields.groupName ? formErrors.groupName : ''}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newItemGroup.active}
                        onChange={(e) => handleNewItemGroupChange('active', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" onClick={closeCreateForm} disabled={loading} sx={{ flex: 1 }}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleCreateItemGroup}
                      startIcon={creatingItemGroup ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      disabled={loading || !isCreateFormValid || isCheckingCode}
                      sx={{ flex: 1 }}
                    >
                      {creatingItemGroup ? 'Creating...' : 'Create'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Collapse>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: theme.palette.primary.main, color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {itemGroups.length}
                </Typography>
                <Typography variant="body2">Total Groups</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: theme.palette.success.main, color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {itemGroups.filter((group) => group.active).length}
                </Typography>
                <Typography variant="body2">Active Groups</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: theme.palette.info.main, color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {filteredItemGroups.length}
                </Typography>
                <Typography variant="body2">Filtered Results</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search by group code or name..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>

        {/* Results Count */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {filteredItemGroups.length} of {itemGroups.length} item groups
        </Typography>

        {/* Item Groups Table */}
        <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                Item Groups List
              </Typography>
            </Box>

            {itemGroupsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  maxHeight: '600px',
                  overflow: 'auto'
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                      <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Group Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Group Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Created By & Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedItemGroups.map((itemGroup) => (
                      <TableRow
                        key={itemGroup.groupID}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {itemGroup.groupCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{itemGroup.groupName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={itemGroup.active ? <ActiveIcon /> : <InactiveIcon />}
                            label={itemGroup.active ? 'Active' : 'Inactive'}
                            color={itemGroup.active ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {itemGroup.createdByName || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(itemGroup.createdDT)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEditDialog(itemGroup)} color="primary" disabled={loading}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteItemGroup(itemGroup.groupID)}
                                color="error"
                                disabled={loading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedItemGroups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            {itemGroups.length === 0
                              ? 'No item groups found. Create your first group!'
                              : 'No results match your search criteria.'}
                          </Typography>
                          {itemGroups.length === 0 && (
                            <Button variant="contained" onClick={openCreateForm} sx={{ mt: 2 }}>
                              Create First Group
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredItemGroups.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                '& .MuiTablePagination-toolbar': {
                  padding: 2
                }
              }}
            />
          </CardContent>
        </Card>
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: '450px',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 2,
            flexShrink: 0
          }}
        >
          <EditIcon />
          Edit Item Group
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            flex: '1 1 auto',
            overflow: 'visible'
          }}
        >
          {/* Group Code Field */}
          <TextField
            fullWidth
            variant="outlined"
            label="Group Code"
            value={editingItemGroup?.groupCode || ''}
            onChange={(e) => handleEditItemGroupChange('groupCode', e.target.value)}
            onBlur={(e) => handleGroupCodeBlur(e.target.value, true, editingItemGroup?.groupID)}
            placeholder="Enter unique group code (2-50 characters)"
            required
            error={!!formErrors.groupCode && touchedFields.groupCode}
            helperText={
              formErrors.groupCode && touchedFields.groupCode
                ? formErrors.groupCode
                : 'Group code must be unique and between 2-50 characters'
            }
            disabled={isCheckingCode}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: theme.palette.text.primary,
                fontWeight: 'medium',
                backgroundColor: 'white',
                px: 0.5,
                borderRadius: 1,
                '&.Mui-focused': {
                  color: theme.palette.primary.main
                }
              }
            }}
            InputProps={{
              endAdornment: isCheckingCode ? <CircularProgress size={20} /> : null,
              sx: {
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2
                }
              }
            }}
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.light
                }
              }
            }}
          />

          {/* Group Name Field */}
          <TextField
            fullWidth
            variant="outlined"
            label="Group Name"
            value={editingItemGroup?.groupName || ''}
            onChange={(e) => handleEditItemGroupChange('groupName', e.target.value)}
            onBlur={(e) => handleGroupNameBlur(e.target.value)}
            placeholder="Enter group name (2-50 characters)"
            required
            error={!!formErrors.groupName && touchedFields.groupName}
            helperText={
              formErrors.groupName && touchedFields.groupName ? formErrors.groupName : 'Group name must be between 2-50 characters'
            }
            InputLabelProps={{
              shrink: true,
              sx: {
                color: theme.palette.text.primary,
                fontWeight: 'medium',
                backgroundColor: 'white',
                px: 0.5,
                borderRadius: 1,
                '&.Mui-focused': {
                  color: theme.palette.primary.main
                }
              }
            }}
            InputProps={{
              sx: {
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2
                }
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.light
                }
              }
            }}
          />

          {/* Active Switch */}
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={editingItemGroup?.active || false}
                  onChange={(e) => handleEditItemGroupChange('active', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" fontWeight="medium">
                  Active
                </Typography>
              }
            />
            <FormHelperText sx={{ mt: 1, ml: 0 }}>
              {editingItemGroup?.active
                ? 'This group will be visible and available for use'
                : 'This group will be hidden and unavailable for use'}
            </FormHelperText>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 1,
            flexShrink: 0
          }}
        >
          <Button
            onClick={closeDialog}
            sx={{
              color: theme.palette.text.secondary,
              borderRadius: 1,
              px: 3,
              border: `1px solid ${theme.palette.grey[300]}`,
              '&:hover': {
                backgroundColor: theme.palette.grey[50]
              }
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateItemGroup}
            startIcon={updatingItemGroup ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading || !isEditFormValid || isCheckingCode}
            sx={{
              borderRadius: 1,
              minWidth: '120px',
              px: 3,
              fontWeight: 'bold'
            }}
          >
            {updatingItemGroup ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemGroupManagement;
