// src/views/Dashboard/ItemCategory/ItemCategoryManagement.jsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import {
  useGetItemCategoriesQuery,
  useCreateItemCategoryMutation,
  useUpdateItemCategoryMutation,
  useDeleteItemCategoryMutation,
  useLazyCheckCategoryCodeExistsQuery
} from '../../../store/api/itemCategoryApi';
import { useGetItemGroupsQuery } from '../../../store/api/itemGroupApi';

const ItemCategoryManagement = () => {
  const theme = useTheme();
  const currentUser = useSelector((state) => state.auth.user);

  // RTK Query hooks
  const {
    data: itemCategoriesResponse,
    isLoading: itemCategoriesLoading,
    error: itemCategoriesError,
    refetch: refetchItemCategories
  } = useGetItemCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  const { data: itemGroupsResponse, isLoading: itemGroupsLoading } = useGetItemGroupsQuery();

  const [createItemCategory, { isLoading: creatingItemCategory }] = useCreateItemCategoryMutation();
  const [updateItemCategory, { isLoading: updatingItemCategory }] = useUpdateItemCategoryMutation();
  const [deleteItemCategory, { isLoading: deletingItemCategory }] = useDeleteItemCategoryMutation();
  const [checkCategoryCodeExists] = useLazyCheckCategoryCodeExistsQuery();

  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItemCategory, setEditingItemCategory] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [createFormOpen, setCreateFormOpen] = useState(false);

  // New item category form state
  const [newItemCategory, setNewItemCategory] = useState({
    categoryCode: '',
    categoryName: '',
    groupID: ''
  });

  const itemCategories = itemCategoriesResponse || [];
  const itemGroups = itemGroupsResponse?.data || [];

  // Filtered and paginated data
  const filteredItemCategories = useMemo(() => {
    return itemCategories.filter((itemCategory) => {
      const matchesSearch =
        itemCategory.categoryCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itemCategory.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itemCategory.groupCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itemCategory.groupName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [itemCategories, searchTerm]);

  const paginatedItemCategories = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredItemCategories.slice(start, start + rowsPerPage);
  }, [filteredItemCategories, page, rowsPerPage]);

  // Combined loading state
  const loading = itemCategoriesLoading || itemGroupsLoading || creatingItemCategory || updatingItemCategory || deletingItemCategory;

  // Handle errors
  useEffect(() => {
    if (itemCategoriesError) {
      console.error('Item Categories Error:', itemCategoriesError);
      const errorData = itemCategoriesError.data;
      let errorMessage = 'Failed to load item categories';

      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        }
      } else if (itemCategoriesError.error) {
        errorMessage = itemCategoriesError.error;
      } else if (itemCategoriesError.status) {
        errorMessage = `Error ${itemCategoriesError.status}: Failed to load data`;
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    }
  }, [itemCategoriesError]);

  // Handle input changes for new item category
  const handleNewItemCategoryChange = useCallback(
    (field, value) => {
      setNewItemCategory((prev) => ({
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

  // Handle input changes for editing item category
  const handleEditItemCategoryChange = useCallback(
    (field, value) => {
      setEditingItemCategory((prev) => ({
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

  // Check if category code already exists
  const validateCategoryCode = async (categoryCode, excludeId = null) => {
    const trimmedCode = categoryCode.trim();

    if (!trimmedCode) return false;

    try {
      setIsCheckingCode(true);
      const result = await checkCategoryCodeExists({
        categoryCode: trimmedCode,
        excludeId
      }).unwrap();

      console.log('Code check result:', result);
      return !result.exists;
    } catch (error) {
      console.error('Error checking category code:', error);
      return false;
    } finally {
      setIsCheckingCode(false);
    }
  };

  // Real-time validation for category code
  const handleCategoryCodeBlur = async (value, isEdit = false, categoryID = null) => {
    const trimmedValue = value.trim();
    handleFieldTouch('categoryCode');

    if (!trimmedValue) {
      setFormErrors((prev) => ({ ...prev, categoryCode: 'Category code is required' }));
      return;
    }

    if (trimmedValue.length < 2) {
      setFormErrors((prev) => ({ ...prev, categoryCode: 'Category code must be at least 2 characters' }));
      return;
    }

    if (trimmedValue.length > 50) {
      setFormErrors((prev) => ({ ...prev, categoryCode: 'Category code must be less than 50 characters' }));
      return;
    }

    // Check if code exists
    const isValidCode = await validateCategoryCode(trimmedValue, isEdit ? categoryID : null);
    if (!isValidCode) {
      setFormErrors((prev) => ({ ...prev, categoryCode: 'Category code already exists' }));
    } else {
      setFormErrors((prev) => ({ ...prev, categoryCode: '' }));
    }
  };

  // Real-time validation for category name
  const handleCategoryNameBlur = (value) => {
    const trimmedValue = value.trim();
    handleFieldTouch('categoryName');

    if (!trimmedValue) {
      setFormErrors((prev) => ({ ...prev, categoryName: 'Category name is required' }));
      return;
    }

    if (trimmedValue.length < 2) {
      setFormErrors((prev) => ({ ...prev, categoryName: 'Category name must be at least 2 characters' }));
      return;
    }

    if (trimmedValue.length > 250) {
      setFormErrors((prev) => ({ ...prev, categoryName: 'Category name must be less than 250 characters' }));
      return;
    }

    setFormErrors((prev) => ({ ...prev, categoryName: '' }));
  };

  // Validate form before submission
  const validateForm = async (formData, isEdit = false) => {
    const errors = {};

    // Category Code validation
    if (!formData.categoryCode?.trim()) {
      errors.categoryCode = 'Category code is required';
    } else if (formData.categoryCode.trim().length < 2) {
      errors.categoryCode = 'Category code must be at least 2 characters';
    } else if (formData.categoryCode.trim().length > 50) {
      errors.categoryCode = 'Category code must be less than 50 characters';
    } else {
      // Check if category code exists (only for create or when code changes in edit)
      if (!isEdit || (isEdit && formData.categoryCode !== itemCategories.find((c) => c.categoryID === formData.categoryID)?.categoryCode)) {
        const isValidCode = await validateCategoryCode(formData.categoryCode, isEdit ? formData.categoryID : null);
        if (!isValidCode) {
          errors.categoryCode = 'Category code already exists';
        }
      }
    }

    // Category Name validation
    if (!formData.categoryName?.trim()) {
      errors.categoryName = 'Category name is required';
    } else if (formData.categoryName.trim().length < 2) {
      errors.categoryName = 'Category name must be at least 2 characters';
    } else if (formData.categoryName.trim().length > 250) {
      errors.categoryName = 'Category name must be less than 250 characters';
    }

    // Group ID validation
    if (!formData.groupID) {
      errors.groupID = 'Item group is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open create form
  const openCreateForm = () => {
    setCreateFormOpen(true);
    setNewItemCategory({
      categoryCode: '',
      categoryName: '',
      groupID: ''
    });
    setFormErrors({});
    setTouchedFields({});
  };

  // Close create form
  const closeCreateForm = () => {
    setCreateFormOpen(false);
    setNewItemCategory({
      categoryCode: '',
      categoryName: '',
      groupID: ''
    });
    setFormErrors({});
    setTouchedFields({});
  };

  // Open edit dialog
  const openEditDialog = (itemCategory) => {
    setEditingItemCategory({
      categoryID: itemCategory.categoryID,
      categoryCode: itemCategory.categoryCode || '',
      categoryName: itemCategory.categoryName || '',
      groupID: itemCategory.groupID || ''
    });
    setFormErrors({});
    setTouchedFields({});
    setDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItemCategory(null);
    setFormErrors({});
    setTouchedFields({});
  };

  // Create new item category
  const handleCreateItemCategory = async () => {
    try {
      const formData = {
        categoryCode: (newItemCategory.categoryCode || '').trim(),
        categoryName: (newItemCategory.categoryName || '').trim(),
        groupID: parseInt(newItemCategory.groupID),
        createdBy: currentUser?.userID || 0
      };

      console.log('Sending data to backend:', formData);

      // Validate all fields before submission
      setTouchedFields({ categoryCode: true, categoryName: true, groupID: true });
      const isValid = await validateForm(formData, false);
      if (!isValid) {
        setMessage({ type: 'error', text: 'Please fix the validation errors before submitting.' });
        return;
      }

      await createItemCategory(formData).unwrap();

      // Reset form and close create form
      setNewItemCategory({
        categoryCode: '',
        categoryName: '',
        groupID: ''
      });

      setCreateFormOpen(false);
      setMessage({ type: 'success', text: 'Item category created successfully!' });
      refetchItemCategories();
    } catch (error) {
      console.error('Create item category error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to create item category';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Update item category
  const handleUpdateItemCategory = async () => {
    try {
      const formData = {
        categoryCode: (editingItemCategory.categoryCode || '').trim(),
        categoryName: (editingItemCategory.categoryName || '').trim(),
        groupID: parseInt(editingItemCategory.groupID),
        modifyBy: currentUser?.userID || 0
      };

      console.log('Sending update data to backend:', formData);

      // Validate all fields before submission
      setTouchedFields({ categoryCode: true, categoryName: true, groupID: true });
      const isValid = await validateForm({ ...formData, categoryID: editingItemCategory.categoryID }, true);
      if (!isValid) {
        setMessage({ type: 'error', text: 'Please fix the validation errors before submitting.' });
        return;
      }

      await updateItemCategory({
        id: editingItemCategory.categoryID,
        ...formData
      }).unwrap();

      setDialogOpen(false);
      setEditingItemCategory(null);
      setMessage({ type: 'success', text: 'Item category updated successfully!' });
      refetchItemCategories();
    } catch (error) {
      console.error('Update item category error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to update item category';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Delete item category
  const handleDeleteItemCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item category?')) {
      return;
    }

    try {
      await deleteItemCategory(id).unwrap();
      setMessage({ type: 'success', text: 'Item category deleted successfully!' });
      refetchItemCategories();
    } catch (error) {
      console.error('Delete item category error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to delete item category';
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
    const hasCategoryCode = newItemCategory.categoryCode?.trim().length >= 2 && newItemCategory.categoryCode.trim().length <= 50;
    const hasCategoryName = newItemCategory.categoryName?.trim().length >= 2 && newItemCategory.categoryName.trim().length <= 250;
    const hasGroupID = !!newItemCategory.groupID;
    const noErrors = !formErrors.categoryCode && !formErrors.categoryName && !formErrors.groupID;
    const notChecking = !isCheckingCode;

    return hasCategoryCode && hasCategoryName && hasGroupID && noErrors && notChecking;
  }, [newItemCategory, formErrors, isCheckingCode]);

  const isEditFormValid = useMemo(() => {
    if (!editingItemCategory) return false;
    const hasCategoryCode = editingItemCategory.categoryCode?.trim().length >= 2 && editingItemCategory.categoryCode.trim().length <= 50;
    const hasCategoryName = editingItemCategory.categoryName?.trim().length >= 2 && editingItemCategory.categoryName.trim().length <= 250;
    const hasGroupID = !!editingItemCategory.groupID;
    const noErrors = !formErrors.categoryCode && !formErrors.categoryName && !formErrors.groupID;
    const notChecking = !isCheckingCode;

    return hasCategoryCode && hasCategoryName && hasGroupID && noErrors && notChecking;
  }, [editingItemCategory, formErrors, isCheckingCode]);

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
          ITEM CATEGORY MANAGEMENT
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Refresh Categories">
            <IconButton
              color="primary"
              sx={{ border: `1px solid ${theme.palette.primary.main}` }}
              onClick={refetchItemCategories}
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
            {createFormOpen ? 'Cancel Create' : 'Add Category'}
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
                Create New Item Category
              </Typography>

              <Grid container spacing={2} alignItems="flex-start">
                {/* Adjust the grid layout to give more space to buttons */}
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} md={2.5}>
                    {' '}
                    {/* Reduced from 3 */}
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Category Code"
                      value={newItemCategory.categoryCode}
                      onChange={(e) => handleNewItemCategoryChange('categoryCode', e.target.value)}
                      onBlur={(e) => handleCategoryCodeBlur(e.target.value, false)}
                      placeholder="Enter unique category code"
                      required
                      error={!!formErrors.categoryCode && touchedFields.categoryCode}
                      helperText={
                        formErrors.categoryCode && touchedFields.categoryCode ? formErrors.categoryCode : 'Must be 2-50 characters'
                      }
                      disabled={isCheckingCode}
                      size="small"
                      InputProps={{
                        endAdornment: isCheckingCode ? <CircularProgress size={20} /> : null
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3.5}>
                    {' '}
                    {/* Reduced from 4 */}
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Category Name"
                      value={newItemCategory.categoryName}
                      onChange={(e) => handleNewItemCategoryChange('categoryName', e.target.value)}
                      onBlur={(e) => handleCategoryNameBlur(e.target.value)}
                      placeholder="Enter category name"
                      required
                      error={!!formErrors.categoryName && touchedFields.categoryName}
                      helperText={
                        formErrors.categoryName && touchedFields.categoryName ? formErrors.categoryName : 'Must be 2-250 characters'
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    {' '}
                    {/* Reduced from 3 */}
                    <FormControl fullWidth size="small" error={!!formErrors.groupID && touchedFields.groupID}>
                      <InputLabel>Item Group *</InputLabel>
                      <Select
                        value={newItemCategory.groupID}
                        label="Item Group *"
                        onChange={(e) => handleNewItemCategoryChange('groupID', e.target.value)}
                        onBlur={() => handleFieldTouch('groupID')}
                      >
                        <MenuItem value="">
                          <em>Select Item Group</em>
                        </MenuItem>
                        {itemGroups.map((group) => (
                          <MenuItem key={group.groupID} value={group.groupID}>
                            {group.groupCode} - {group.groupName}
                            {!group.active && ' (Inactive)'}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.groupID && touchedFields.groupID && <FormHelperText>{formErrors.groupID}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    {' '}
                    {/* Increased from 2 */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Button variant="outlined" onClick={closeCreateForm} disabled={loading} sx={{ flex: 1 }}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleCreateItemCategory}
                        startIcon={creatingItemCategory ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading || !isCreateFormValid || isCheckingCode}
                        sx={{ flex: 1 }}
                      >
                        {creatingItemCategory ? 'Creating...' : 'Create'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Collapse>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: theme.palette.primary.main, color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {itemCategories.length}
                </Typography>
                <Typography variant="body2">Total Categories</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: theme.palette.success.main, color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {itemGroups.length}
                </Typography>
                <Typography variant="body2">Available Groups</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: theme.palette.info.main, color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {filteredItemCategories.length}
                </Typography>
                <Typography variant="body2">Filtered Results</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: theme.palette.warning.main, color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {new Set(itemCategories.map((ic) => ic.groupID)).size}
                </Typography>
                <Typography variant="body2">Groups in Use</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search by category code, name, or group..."
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
          Showing {filteredItemCategories.length} of {itemCategories.length} item categories
        </Typography>

        {/* Item Categories Table */}
        <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                Item Categories List
              </Typography>
            </Box>

            {itemCategoriesLoading ? (
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
                      <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Category Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Category Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Item Group</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Group Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Created By & Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedItemCategories.map((itemCategory) => (
                      <TableRow
                        key={itemCategory.categoryID}
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
                            {itemCategory.categoryCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{itemCategory.categoryName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GroupIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {itemCategory.groupCode}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {itemCategory.groupName}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={itemCategory.groupActive ? <ActiveIcon /> : <InactiveIcon />}
                            label={itemCategory.groupActive ? 'Active' : 'Inactive'}
                            color={itemCategory.groupActive ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {itemCategory.createdByName || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(itemCategory.createdDT)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEditDialog(itemCategory)} color="primary" disabled={loading}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteItemCategory(itemCategory.categoryID)}
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
                    {paginatedItemCategories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            {itemCategories.length === 0
                              ? 'No item categories found. Create your first category!'
                              : 'No results match your search criteria.'}
                          </Typography>
                          {itemCategories.length === 0 && (
                            <Button variant="contained" onClick={openCreateForm} sx={{ mt: 2 }}>
                              Create First Category
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
              count={filteredItemCategories.length}
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
          Edit Item Category
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
          {/* Category Code Field */}
          <TextField
            fullWidth
            variant="outlined"
            label="Category Code"
            value={editingItemCategory?.categoryCode || ''}
            onChange={(e) => handleEditItemCategoryChange('categoryCode', e.target.value)}
            onBlur={(e) => handleCategoryCodeBlur(e.target.value, true, editingItemCategory?.categoryID)}
            placeholder="Enter unique category code (2-50 characters)"
            required
            error={!!formErrors.categoryCode && touchedFields.categoryCode}
            helperText={
              formErrors.categoryCode && touchedFields.categoryCode
                ? formErrors.categoryCode
                : 'Category code must be unique and between 2-50 characters'
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

          {/* Category Name Field */}
          <TextField
            fullWidth
            variant="outlined"
            label="Category Name"
            value={editingItemCategory?.categoryName || ''}
            onChange={(e) => handleEditItemCategoryChange('categoryName', e.target.value)}
            onBlur={(e) => handleCategoryNameBlur(e.target.value)}
            placeholder="Enter category name (2-250 characters)"
            required
            error={!!formErrors.categoryName && touchedFields.categoryName}
            helperText={
              formErrors.categoryName && touchedFields.categoryName
                ? formErrors.categoryName
                : 'Category name must be between 2-250 characters'
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

          {/* Group Select Field */}
          <FormControl fullWidth error={!!formErrors.groupID && touchedFields.groupID}>
            <InputLabel>Item Group *</InputLabel>
            <Select
              value={editingItemCategory?.groupID || ''}
              label="Item Group *"
              onChange={(e) => handleEditItemCategoryChange('groupID', e.target.value)}
              onBlur={() => handleFieldTouch('groupID')}
            >
              <MenuItem value="">
                <em>Select Item Group</em>
              </MenuItem>
              {itemGroups.map((group) => (
                <MenuItem key={group.groupID} value={group.groupID}>
                  {group.groupCode} - {group.groupName}
                  {!group.active && ' (Inactive)'}
                </MenuItem>
              ))}
            </Select>
            {formErrors.groupID && touchedFields.groupID && <FormHelperText>{formErrors.groupID}</FormHelperText>}
          </FormControl>
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
            onClick={handleUpdateItemCategory}
            startIcon={updatingItemCategory ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading || !isEditFormValid || isCheckingCode}
            sx={{
              borderRadius: 1,
              minWidth: '120px',
              px: 3,
              fontWeight: 'bold'
            }}
          >
            {updatingItemCategory ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemCategoryManagement;
