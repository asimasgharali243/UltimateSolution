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
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  People as PaxIcon
} from '@mui/icons-material';
import {
  useGetPaxesQuery,
  useCreatePaxMutation,
  useUpdatePaxMutation,
  useDeletePaxMutation,
  useLazyCheckPaxNameExistsQuery
} from '../../../store/api/paxApi';

const PaxManagement = () => {
  const theme = useTheme();

  // Get user from Redux store
  const { user } = useSelector((state) => state.auth);

  // State management
  const [newPax, setNewPax] = useState({
    paxTitle: ''
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPax, setEditingPax] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationError, setValidationError] = useState('');
  const [editValidationError, setEditValidationError] = useState('');

  // RTK Query hooks
  const { data: paxList = [], isLoading, error, refetch } = useGetPaxesQuery();
  const [createPax, { isLoading: creating }] = useCreatePaxMutation();
  const [updatePax, { isLoading: updating }] = useUpdatePaxMutation();
  const [deletePax, { isLoading: deleting }] = useDeletePaxMutation();

  // Lazy validation queries for better control
  const [checkName, { isLoading: nameChecking }] = useLazyCheckPaxNameExistsQuery();
  const [checkEditName, { isLoading: editNameChecking }] = useLazyCheckPaxNameExistsQuery();

  // Handle errors
  useEffect(() => {
    if (error) {
      setMessage({ type: 'error', text: 'Failed to load pax titles' });
    }
  }, [error]);

  // Handle validation for new pax title
  useEffect(() => {
    if (newPax.paxTitle.trim()) {
      const timer = setTimeout(async () => {
        try {
          const result = await checkName({ paxTitle: newPax.paxTitle }).unwrap();
          setValidationError(result ? 'Pax title already exists' : '');
        } catch (error) {
          console.error('Name check error:', error);
          setValidationError('');
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setValidationError('');
    }
  }, [newPax.paxTitle, checkName]);

  // Handle validation for editing pax title
  useEffect(() => {
    if (editingPax?.paxTitle?.trim()) {
      const timer = setTimeout(async () => {
        try {
          const result = await checkEditName({
            paxTitle: editingPax.paxTitle,
            excludeId: editingPax.paxID
          }).unwrap();
          setEditValidationError(result ? 'Pax title already exists' : '');
        } catch (error) {
          console.error('Edit name check error:', error);
          setEditValidationError('');
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEditValidationError('');
    }
  }, [editingPax?.paxTitle, editingPax?.paxID, checkEditName]);

  // Handle input changes for new pax
  const handleNewPaxChange = (field, value) => {
    setNewPax((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle input changes for editing pax
  const handleEditPaxChange = (field, value) => {
    setEditingPax((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new pax
  const addPax = async () => {
    if (!newPax.paxTitle.trim()) {
      setMessage({ type: 'error', text: 'Pax title is required' });
      return;
    }

    if (validationError) {
      setMessage({ type: 'error', text: 'Pax title already exists' });
      return;
    }

    try {
      const paxData = {
        paxTitle: newPax.paxTitle.trim()
      };

      await createPax(paxData).unwrap();
      setNewPax({ paxTitle: '' });
      setValidationError('');
      setMessage({ type: 'success', text: 'Pax title added successfully!' });
    } catch (error) {
      console.error('Create pax error:', error);
      if (error.status === 409) {
        setMessage({ type: 'error', text: 'Pax title already exists' });
      } else {
        setMessage({ type: 'error', text: 'Failed to add pax title' });
      }
    }
  };

  // Edit pax
  const openEditDialog = (pax) => {
    setEditingPax({
      ...pax,
      // Ensure all fields are properly set
      paxID: pax.paxID,
      paxTitle: pax.paxTitle || '',
      CreatedBy: pax.createdBy || pax.CreatedBy,
      CreatedDT: pax.createdDT || pax.CreatedDT,
      ModifyBy: pax.modifyBy || pax.ModifyBy,
      ModifyDT: pax.modifyDT || pax.ModifyDT
    });
    setEditDialogOpen(true);
    setEditValidationError('');
  };

  const saveEditedPax = async () => {
    if (!editingPax?.paxTitle?.trim()) {
      setMessage({ type: 'error', text: 'Pax title is required' });
      return;
    }

    if (editValidationError) {
      setMessage({ type: 'error', text: 'Pax title already exists' });
      return;
    }

    if (!editingPax.paxID) {
      setMessage({ type: 'error', text: 'Invalid pax ID' });
      return;
    }

    try {
      const updateData = {
        paxID: editingPax.paxID,
        paxTitle: editingPax.paxTitle.trim()
      };

      await updatePax(updateData).unwrap();
      setEditDialogOpen(false);
      setEditingPax(null);
      setEditValidationError('');
      setMessage({ type: 'success', text: 'Pax title updated successfully!' });
    } catch (error) {
      console.error('Update pax error:', error);
      if (error.status === 409) {
        setMessage({ type: 'error', text: 'Pax title already exists' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update pax title' });
      }
    }
  };

  // Delete pax
  const deletePaxHandler = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pax title?')) {
      return;
    }

    try {
      await deletePax(id).unwrap();
      setMessage({ type: 'success', text: 'Pax title deleted successfully!' });
    } catch (error) {
      console.error('Delete pax error:', error);
      setMessage({ type: 'error', text: 'Failed to delete pax title' });
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

  // Get chip color based on pax title
  const getPaxColor = (paxTitle) => {
    if (!paxTitle) return 'default';
    const title = paxTitle.toLowerCase();
    if (title.includes('infant')) return 'info';
    if (title.includes('1 pax')) return 'primary';
    if (title.includes('2 pax')) return 'success';
    if (title.includes('3 pax')) return 'warning';
    if (title.includes('4 pax')) return 'secondary';
    if (title.includes('5+ pax')) return 'error';
    return 'default';
  };

  // Get icon based on pax title
  const getPaxIcon = (paxTitle) => {
    if (!paxTitle) return '👤';
    const title = paxTitle.toLowerCase();
    if (title.includes('infant')) return '🍼';
    if (title.includes('1 pax')) return '👤';
    if (title.includes('2 pax')) return '👥';
    if (title.includes('3 pax')) return '👨‍👩‍👦';
    if (title.includes('4 pax')) return '👨‍👩‍👧‍👦';
    if (title.includes('5+ pax')) return '👨‍👩‍👧‍👦👥';
    return '👤';
  };

  // Display user name
  const getUserDisplayName = (userId) => {
    if (!userId) return '-';

    // Get current user ID from auth state
    const currentUserId = user?.userID || user?.userId;

    if (currentUserId && currentUserId === userId) {
      return 'You';
    }

    return `User ${userId}`;
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
          <PaxIcon sx={{ fontSize: 'inherit' }} />
          PAX TITLE MANAGEMENT
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Print Pax List">
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

        {/* Add New Pax Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              Add New Pax Title
            </Typography>

            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              {/* Pax Title */}
              <Grid item xs={12} sm={8} md={6}>
                <TextField
                  fullWidth
                  label="Pax Title"
                  value={newPax.paxTitle}
                  onChange={(e) => handleNewPaxChange('paxTitle', e.target.value)}
                  size="small"
                  variant="outlined"
                  placeholder="Enter pax title..."
                  disabled={loading}
                  error={!!validationError}
                  helperText={validationError || 'e.g., infant, 1 pax, 2 pax, etc.'}
                  InputProps={{
                    endAdornment: newPax.paxTitle.trim() && (
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
                    onClick={addPax}
                    disabled={loading || !newPax.paxTitle.trim() || !!validationError || nameChecking}
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
                    {creating ? 'Adding...' : 'Add Pax Title'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Pax List Card */}
        <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                Pax Titles List
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Pax Titles: {paxList.length}
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
                <Table size="small" sx={{ minWidth: 800 }}>
                  <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableRow>
                      {[
                        { header: 'Pax ID', width: '100px' },
                        { header: 'Pax Title', width: '200px' },
                        { header: 'Icon', width: '80px' },
                        { header: 'Display', width: '150px' },
                        { header: 'Created By', width: '120px' },
                        { header: 'Created Date', width: '150px' },
                        { header: 'Modified By', width: '120px' },
                        { header: 'Modified Date', width: '150px' },
                        { header: 'Status', width: '120px' },
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
                    {paxList.map((pax) => (
                      <TableRow
                        key={pax.paxID}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                          '&:hover': { backgroundColor: theme.palette.action.selected }
                        }}
                      >
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            #{pax.paxID}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body1" fontWeight="medium">
                            {pax.paxTitle}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                            {getPaxIcon(pax.paxTitle)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Chip
                            label={pax.paxTitle}
                            color={getPaxColor(pax.paxTitle)}
                            variant="filled"
                            size="small"
                            sx={{ fontWeight: 'bold', minWidth: '100px' }}
                          />
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{getUserDisplayName(pax.createdBy)}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{formatDate(pax.createdDT)}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{pax.modifyBy ? getUserDisplayName(pax.modifyBy) : '-'}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{formatDate(pax.modifyDT)}</Typography>
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
                            <Tooltip title="Edit Pax Title">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openEditDialog(pax)}
                                sx={{ borderRadius: 1 }}
                                disabled={loading}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Pax Title">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deletePaxHandler(pax.paxID)}
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
                      <TableCell colSpan={10} align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
                        Total Pax Titles: {paxList.length} | Last Updated:{' '}
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

            {paxList.length === 0 && !isLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PaxIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No pax titles found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add your first pax title using the form above.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Paper>

      {/* Edit Pax Dialog */}
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
          Edit Pax Title
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {editingPax && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pax Title"
                  value={editingPax.paxTitle || ''}
                  onChange={(e) => handleEditPaxChange('paxTitle', e.target.value)}
                  size="small"
                  variant="outlined"
                  disabled={loading}
                  error={!!editValidationError}
                  helperText={editValidationError || 'Enter the pax title (e.g., infant, 1 pax, 2 pax, etc.)'}
                  sx={{ mt: 1 }}
                  InputProps={{
                    endAdornment: editingPax.paxTitle?.trim() && (
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
                    Pax Title Information:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption">Created:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(editingPax.createdDT)} by {getUserDisplayName(editingPax.createdBy)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">Last Modified:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {editingPax.modifyDT ? `${formatDate(editingPax.modifyDT)} by ${getUserDisplayName(editingPax.modifyBy)}` : 'Never'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption">Preview:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography variant="h5">{getPaxIcon(editingPax.paxTitle)}</Typography>
                        <Chip
                          label={editingPax.paxTitle}
                          color={getPaxColor(editingPax.paxTitle)}
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
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
            onClick={saveEditedPax}
            startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading || !editingPax?.paxTitle?.trim() || !!editValidationError || editNameChecking}
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaxManagement;
