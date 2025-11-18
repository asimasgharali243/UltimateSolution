import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  TableFooter,
  Grid,
  TextField,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Inventory as PackageIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  useGetPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  useLazyCheckPackageNameExistsQuery
} from '../../../store/api/packageApi';

const PackageManagement = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  // State management
  const [newPackage, setNewPackage] = useState({
    packgeTitle: '' // Changed to match backend
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationError, setValidationError] = useState('');
  const [editValidationError, setEditValidationError] = useState('');

  // RTK Query hooks
  const { data: packages = [], isLoading, error, refetch } = useGetPackagesQuery();
  const [createPackage, { isLoading: creating }] = useCreatePackageMutation();
  const [updatePackage, { isLoading: updating }] = useUpdatePackageMutation();
  const [deletePackage, { isLoading: deleting }] = useDeletePackageMutation();
  isLoading ? null : console.log(packages);
  // Debug logging
  useEffect(() => {
    if (!isLoading && packages) {
      console.log('Packages Data:', packages);
    }
  }, [packages, isLoading]);

  // Lazy validation queries
  const [checkName, { isLoading: nameChecking }] = useLazyCheckPackageNameExistsQuery();
  const [checkEditName, { isLoading: editNameChecking }] = useLazyCheckPackageNameExistsQuery();

  // Handle errors
  useEffect(() => {
    if (error) {
      setMessage({ type: 'error', text: 'Failed to load packages' });
    }
  }, [error]);

  // Handle validation for new package title
  useEffect(() => {
    if (newPackage.packgeTitle.trim()) {
      const timer = setTimeout(async () => {
        try {
          const result = await checkName({ packgeTitle: newPackage.packgeTitle }).unwrap();
          setValidationError(result ? 'Package title already exists' : '');
        } catch (error) {
          console.error('Name check error:', error);
          setValidationError('');
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setValidationError('');
    }
  }, [newPackage.packgeTitle, checkName]);

  // Handle validation for editing package title
  useEffect(() => {
    if (editingPackage?.packgeTitle?.trim()) {
      const timer = setTimeout(async () => {
        try {
          const result = await checkEditName({
            packgeTitle: editingPackage.packgeTitle,
            excludeId: editingPackage.packgeID
          }).unwrap();
          setEditValidationError(result ? 'Package title already exists' : '');
        } catch (error) {
          console.error('Edit name check error:', error);
          setEditValidationError('');
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEditValidationError('');
    }
  }, [editingPackage?.packgeTitle, editingPackage?.packgeID, checkEditName]);

  // Handle input changes for new package
  const handleNewPackageChange = (field, value) => {
    setNewPackage((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle input changes for editing package
  const handleEditPackageChange = (field, value) => {
    setEditingPackage((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new package
  const addPackage = async () => {
    if (!newPackage.packgeTitle.trim()) {
      setMessage({ type: 'error', text: 'Package title is required' });
      return;
    }

    if (validationError) {
      setMessage({ type: 'error', text: 'Package title already exists' });
      return;
    }

    try {
      const packageData = {
        packgeTitle: newPackage.packgeTitle.trim() // Changed to match backend
      };

      await createPackage(packageData).unwrap();
      setNewPackage({ packgeTitle: '' }); // Changed to match backend
      setValidationError('');
      setMessage({ type: 'success', text: 'Package added successfully!' });
    } catch (error) {
      console.error('Create package error:', error);
      if (error.status === 409) {
        setMessage({ type: 'error', text: 'Package title already exists' });
      } else {
        setMessage({ type: 'error', text: 'Failed to add package' });
      }
    }
  };

  // Edit package
  const openEditDialog = (pkg) => {
    setEditingPackage({
      ...pkg,
      packgeTitle: pkg.packgeTitle || '' // Changed to match backend
    });
    setEditDialogOpen(true);
    setEditValidationError('');
  };

  const saveEditedPackage = async () => {
    if (!editingPackage?.packgeTitle?.trim()) {
      // Changed to match backend
      setMessage({ type: 'error', text: 'Package title is required' });
      return;
    }

    if (editValidationError) {
      setMessage({ type: 'error', text: 'Package title already exists' });
      return;
    }

    if (!editingPackage.packgeID) {
      setMessage({ type: 'error', text: 'Invalid package ID' });
      return;
    }

    try {
      const updateData = {
        packgeID: editingPackage.packgeID,
        packgeTitle: editingPackage.packgeTitle.trim() // Changed to match backend
      };

      await updatePackage(updateData).unwrap();
      setEditDialogOpen(false);
      setEditingPackage(null);
      setEditValidationError('');
      setMessage({ type: 'success', text: 'Package updated successfully!' });
    } catch (error) {
      console.error('Update package error:', error);
      if (error.status === 409) {
        setMessage({ type: 'error', text: 'Package title already exists' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update package' });
      }
    }
  };

  // Delete package
  const deletePackageHandler = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) {
      return;
    }

    try {
      await deletePackage(id).unwrap();
      setMessage({ type: 'success', text: 'Package deleted successfully!' });
    } catch (error) {
      console.error('Delete package error:', error);
      setMessage({ type: 'error', text: 'Failed to delete package' });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  // Get chip color based on package title
  const getPackageColor = (packageTitle) => {
    if (!packageTitle) return 'default';
    const title = packageTitle.toLowerCase();
    if (title.includes('economy')) return 'success';
    if (title.includes('standard')) return 'info';
    if (title.includes('premium')) return 'warning';
    if (title.includes('deluxe')) return 'error';
    if (title.includes('family')) return 'primary';
    if (title.includes('honeymoon')) return 'secondary';
    if (title.includes('business')) return 'default';
    if (title.includes('group')) return 'success';
    return 'default';
  };

  // User avatar with tooltip
  const renderUserWithAvatar = (userName, userId, isModified = false) => {
    // Handle case where userName or userId is missing
    if (!userName || userName === 'Unknown' || (isModified && !userName)) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {isModified ? 'Not Modified' : 'Unknown'}
          </Typography>
        </Box>
      );
    }

    return (
      <Tooltip title={`User ID: ${userId}`} arrow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {userName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {userId}
            </Typography>
          </Box>
        </Box>
      </Tooltip>
    );
  };

  // Table cell styles
  const tableCellStyles = {
    whiteSpace: 'nowrap',
    overflow: 'visible',
    textOverflow: 'clip',
    padding: '12px 16px'
  };

  const loading = isLoading || creating || updating || deleting || nameChecking || editNameChecking;

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
          <PackageIcon sx={{ fontSize: 'inherit' }} />
          PACKAGE MANAGEMENT
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Print Package List">
            <IconButton color="secondary" sx={{ border: `1px solid ${theme.palette.secondary.main}` }}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Data">
            <IconButton color="success" sx={{ border: `1px solid ${theme.palette.success.main}` }}>
              <EmailIcon />
            </IconButton>
          </Tooltip>
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

        {/* Add New Package Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              Add New Package
            </Typography>

            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              {/* Package Title */}
              <Grid item xs={12} sm={8} md={6}>
                <TextField
                  fullWidth
                  label="Package Title"
                  value={newPackage.packgeTitle} // Changed to match backend
                  onChange={(e) => handleNewPackageChange('packgeTitle', e.target.value)} // Changed to match backend
                  size="small"
                  variant="outlined"
                  placeholder="Enter package title..."
                  disabled={loading}
                  error={!!validationError}
                  helperText={validationError || 'e.g., Economy Package, Premium Package, etc.'}
                  InputProps={{
                    endAdornment: newPackage.packgeTitle.trim() && ( // Changed to match backend
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {nameChecking ? (
                          <CircularProgress size={16} />
                        ) : validationError ? (
                          <Box sx={{ color: 'error.main', fontSize: '1.2rem' }}>✗</Box>
                        ) : (
                          <Box sx={{ color: 'success.main', fontSize: '1.2rem' }}>✓</Box>
                        )}
                      </Box>
                    )
                  }}
                />
              </Grid>

              {/* Add Button */}
              <Grid item xs={12} sm={4} md={6}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                  <Button
                    variant="contained"
                    startIcon={creating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    onClick={addPackage}
                    disabled={loading || !newPackage.packgeTitle.trim() || !!validationError || nameChecking} // Changed to match backend
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      minWidth: '140px',
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark
                      }
                    }}
                  >
                    {creating ? 'Adding...' : 'Add Package'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Packages List Card */}
        <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                Packages List
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Packages: {packages.length}
              </Typography>
            </Box>

            {isLoading ? (
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
                <Table size="small" sx={{ minWidth: 1000 }}>
                  <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableRow>
                      {[
                        { header: 'Package ID', width: '100px' },
                        { header: 'Package Title', width: '200px' },
                        { header: 'Package Type', width: '120px' },
                        { header: 'Created By', width: '150px' },
                        { header: 'Created Date', width: '150px' },
                        { header: 'Modified By', width: '150px' },
                        { header: 'Modified Date', width: '150px' },
                        { header: 'Status', width: '100px' },
                        { header: 'Actions', width: '120px' }
                      ].map((item, index) => (
                        <TableCell
                          key={index}
                          sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            minWidth: item.width,
                            maxWidth: item.width,
                            overflow: 'visible'
                          }}
                        >
                          {item.header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow
                        key={pkg.packgeID}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                          '&:hover': { backgroundColor: theme.palette.action.selected }
                        }}
                      >
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            #{pkg.packgeID}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body1" fontWeight="medium">
                            {pkg.packgeTitle} {/* Changed to match backend */}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Chip
                            label={pkg.packgeTitle?.split(' ')[0] || 'Package'}
                            color={getPackageColor(pkg.packgeTitle)}
                            variant="filled"
                            size="small"
                            sx={{ fontWeight: 'bold', minWidth: '80px' }}
                          />
                        </TableCell>
                        <TableCell sx={tableCellStyles}>{renderUserWithAvatar(pkg.createdByName, pkg.createdBy)}</TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Tooltip title={formatDateTime(pkg.createdDT)} arrow>
                            <Typography variant="body2">{formatDate(pkg.createdDT)}</Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>{renderUserWithAvatar(pkg.modifiedByName, pkg.modifyBy, true)}</TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Tooltip title={pkg.modifyDT ? formatDateTime(pkg.modifyDT) : 'Never modified'} arrow>
                            <Typography variant="body2">{pkg.modifyDT ? formatDate(pkg.modifyDT) : '-'}</Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Chip
                            label="Active"
                            color="success"
                            variant="filled"
                            size="small"
                            sx={{ fontWeight: 'bold', minWidth: '80px' }}
                          />
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Package">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openEditDialog(pkg)}
                                sx={{ borderRadius: 1 }}
                                disabled={loading}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Package">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deletePackageHandler(pkg.packgeID)}
                                sx={{ borderRadius: 1 }}
                                disabled={loading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell colSpan={9} align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
                        Total Packages: {packages.length} | Last Updated:{' '}
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            )}

            {packages.length === 0 && !isLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PackageIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No packages found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add your first package using the form above.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Paper>

      {/* Edit Package Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <EditIcon />
          Edit Package
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {editingPackage && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Package Title"
                  value={editingPackage.packgeTitle || ''} // Changed to match backend
                  onChange={(e) => handleEditPackageChange('packgeTitle', e.target.value)} // Changed to match backend
                  size="small"
                  variant="outlined"
                  disabled={loading}
                  error={!!editValidationError}
                  helperText={editValidationError || 'Enter the package title'}
                  sx={{ mt: 1 }}
                  InputProps={{
                    endAdornment: editingPackage.packgeTitle?.trim() && ( // Changed to match backend
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {editNameChecking ? (
                          <CircularProgress size={16} />
                        ) : editValidationError ? (
                          <Box sx={{ color: 'error.main', fontSize: '1.2rem' }}>✗</Box>
                        ) : (
                          <Box sx={{ color: 'success.main', fontSize: '1.2rem' }}>✓</Box>
                        )}
                      </Box>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 1, mt: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Package Information:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption">Created By:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {editingPackage.createdByName || 'Unknown'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">Created Date:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDateTime(editingPackage.createdDT)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">Last Modified By:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {editingPackage.modifiedByName || 'Never'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">Last Modified Date:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {editingPackage.modifyDT ? formatDateTime(editingPackage.modifyDT) : 'Never'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: theme.palette.text.secondary }} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveEditedPackage}
            startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading || !editingPackage?.packgeTitle?.trim() || !!editValidationError || editNameChecking} // Changed to match backend
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PackageManagement;
