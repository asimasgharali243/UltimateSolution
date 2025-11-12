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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Receipt as VisaIcon,
  People as PaxIcon
} from '@mui/icons-material';
import {
  useGetRateVisasQuery,
  useCreateRateVisaMutation,
  useUpdateRateVisaMutation,
  useDeleteRateVisaMutation
} from '../../../store/api/rateVisaApi';
import { useGetPaxesQuery } from '../../../store/api/paxApi';

const RateVisaManagement = () => {
  const theme = useTheme();
  const currentUser = useSelector((state) => state.auth.user);

  // State management
  const [formData, setFormData] = useState({
    paxid: '',
    rate: ''
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRateVisa, setEditingRateVisa] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // RTK Query hooks
  const { data: rateVisas = [], isLoading, error: rateVisaError, refetch } = useGetRateVisasQuery();
  const { data: paxTypes = [], isLoading: paxLoading, error: paxError } = useGetPaxesQuery();
  const [createRateVisa, { isLoading: creating }] = useCreateRateVisaMutation();
  const [updateRateVisa, { isLoading: updating }] = useUpdateRateVisaMutation();
  const [deleteRateVisa, { isLoading: deleting }] = useDeleteRateVisaMutation();
  isLoading ? null : console.log('records', rateVisas);
  // Handle errors
  useEffect(() => {
    if (rateVisaError) {
      setMessage({ type: 'error', text: 'Failed to load visa rates' });
    }
    if (paxError) {
      setMessage({ type: 'error', text: 'Failed to load passenger types' });
    }
  }, [rateVisaError, paxError]);

  // Handle input changes for new rate visa
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle input changes for editing rate visa
  const handleEditInputChange = (field, value) => {
    setEditingRateVisa((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new rate visa
  const addRateVisa = async () => {
    if (!formData.paxid || !formData.rate) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      const rateVisaData = {
        paxid: parseInt(formData.paxid),
        rate: parseInt(formData.rate)
        // Backend will handle CreatedBy, CreatedDT using JWT token
      };

      await createRateVisa(rateVisaData).unwrap();

      setFormData({
        paxid: '',
        rate: ''
      });
      setMessage({ type: 'success', text: 'Visa rate added successfully!' });
    } catch (error) {
      console.error('Create rate visa error:', error);
      if (error.status === 409) {
        setMessage({ type: 'error', text: 'Visa rate already exists for this passenger type' });
      } else {
        setMessage({ type: 'error', text: 'Failed to add visa rate' });
      }
    }
  };

  // Edit rate visa
  const openEditDialog = (rateVisa) => {
    setEditingRateVisa({
      ...rateVisa,
      paxid: rateVisa.paxid?.toString() || ''
    });
    setEditDialogOpen(true);
  };

  const saveEditedRateVisa = async () => {
    if (!editingRateVisa?.paxid || !editingRateVisa?.rate) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (!editingRateVisa.id) {
      setMessage({ type: 'error', text: 'Invalid visa rate ID' });
      return;
    }

    try {
      const updateData = {
        id: editingRateVisa.id, // Include the ID in the body
        paxid: parseInt(editingRateVisa.paxid),
        rate: parseInt(editingRateVisa.rate)
        // Backend will handle ModifyBy, ModifyDT using JWT token
      };

      await updateRateVisa({
        id: editingRateVisa.id, // ID for the URL
        ...updateData // Data for the body
      }).unwrap();

      setEditDialogOpen(false);
      setEditingRateVisa(null);
      setMessage({ type: 'success', text: 'Visa rate updated successfully!' });
    } catch (error) {
      console.error('Update rate visa error:', error);
      if (error.status === 409) {
        setMessage({ type: 'error', text: 'Visa rate already exists for this passenger type' });
      } else if (error.status === 400) {
        setMessage({ type: 'error', text: 'Invalid request data' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update visa rate' });
      }
    }
  };

  // Delete rate visa
  const deleteRateVisaHandler = async (id) => {
    if (!window.confirm('Are you sure you want to delete this visa rate?')) {
      return;
    }

    try {
      await deleteRateVisa(id).unwrap();
      setMessage({ type: 'success', text: 'Visa rate deleted successfully!' });
    } catch (error) {
      console.error('Delete rate visa error:', error);
      setMessage({ type: 'error', text: 'Failed to delete visa rate' });
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

  // Get chip color based on pax type
  const getPaxTypeColor = (paxTitle) => {
    const title = paxTitle?.toLowerCase() || '';
    if (title.includes('infant')) return 'info';
    if (title.includes('1 pax')) return 'primary';
    if (title.includes('2 pax')) return 'success';
    if (title.includes('3 pax')) return 'warning';
    if (title.includes('4 pax')) return 'secondary';
    if (title.includes('5+ pax')) return 'error';
    return 'default';
  };

  // Display user name
  const getUserDisplayName = (userId) => {
    if (!userId) return '-';

    // Get current user ID from auth state
    const currentUserId = currentUser?.userID || currentUser?.userId;

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

  const loading = isLoading || paxLoading || creating || updating || deleting;

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
          <VisaIcon sx={{ fontSize: 'inherit' }} />
          VISA RATE MANAGEMENT
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Print Visa Rates">
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

        {/* Add New Visa Rate Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              Add New Visa Rate
            </Typography>

            <Grid container spacing={3} alignItems="flex-end" sx={{ mt: 1 }}>
              {/* Pax Type Selection */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Passenger Type</InputLabel>
                  <Select
                    value={formData.paxid}
                    label="Passenger Type"
                    onChange={(e) => handleInputChange('paxid', e.target.value)}
                    sx={{ height: '40px' }}
                    disabled={paxLoading}
                  >
                    {paxTypes.map((pax) => (
                      <MenuItem key={pax.paxID} value={pax.paxID}>
                        {pax.paxTitle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Visa Rate */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Visa Rate"
                  type="number"
                  value={formData.rate}
                  onChange={(e) => handleInputChange('rate', e.target.value)}
                  size="small"
                  variant="outlined"
                  required
                  placeholder="0"
                  InputProps={{
                    startAdornment: <Box sx={{ color: theme.palette.text.secondary, mr: 1 }}>$</Box>
                  }}
                  disabled={loading}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px'
                    }
                  }}
                />
              </Grid>

              {/* Add Button */}
              <Grid item xs={12} sm={12} md={4}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-start', md: 'flex-end' } }}>
                  <Button
                    variant="contained"
                    startIcon={creating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    onClick={addRateVisa}
                    disabled={loading || !formData.paxid || !formData.rate}
                    sx={{
                      height: '40px',
                      borderRadius: 2,
                      px: 3,
                      minWidth: '140px',
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark
                      }
                    }}
                  >
                    {creating ? 'Adding...' : 'Add Visa Rate'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Visa Rates List Card */}
        <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                Visa Rates List
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Visa Rates: {rateVisas.length}
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
                        { header: 'ID', width: '80px' },
                        { header: 'Passenger Type', width: '150px' },
                        { header: 'Visa Rate', width: '120px' },
                        { header: 'Category', width: '150px' },
                        { header: 'Created By', width: '120px' },
                        { header: 'Created Date', width: '120px' },
                        { header: 'Modified By', width: '120px' },
                        { header: 'Modified Date', width: '120px' },
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
                    {rateVisas.map((rateVisa) => (
                      <TableRow
                        key={rateVisa.id}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                          '&:hover': { backgroundColor: theme.palette.action.selected }
                        }}
                      >
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            #{rateVisa.id}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Chip
                            icon={<PaxIcon />}
                            label={rateVisa.pax?.paxTitle || 'Unknown Type'}
                            color={getPaxTypeColor(rateVisa.pax?.paxTitle)}
                            variant="filled"
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body1" fontWeight="bold" color="success.main">
                            ${rateVisa.rate}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Chip label="Visa Fee" color="primary" variant="outlined" size="small" sx={{ fontWeight: 'bold' }} />
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{getUserDisplayName(rateVisa.createdBy)}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{formatDate(rateVisa.createdDT)}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{rateVisa.modifyBy ? getUserDisplayName(rateVisa.modifyBy) : '-'}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{formatDate(rateVisa.modifyDT)}</Typography>
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
                            <Tooltip title="Edit Visa Rate">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openEditDialog(rateVisa)}
                                sx={{ borderRadius: 1 }}
                                disabled={loading}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Visa Rate">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteRateVisaHandler(rateVisa.id)}
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
                        Total Visa Rates: {rateVisas.length} | Last Updated:{' '}
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

            {rateVisas.length === 0 && !isLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <VisaIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No visa rates found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add your first visa rate using the form above.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Paper>

      {/* Edit Visa Rate Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            overflow: 'visible'
          }
        }}
      >
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
          Edit Visa Rate
        </DialogTitle>
        <DialogContent sx={{ p: 3, overflow: 'visible' }}>
          {editingRateVisa && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <InputLabel>Passenger Type</InputLabel>
                  <Select
                    value={editingRateVisa.paxid}
                    label="Passenger Type"
                    onChange={(e) => handleEditInputChange('paxid', e.target.value)}
                    MenuProps={{
                      disablePortal: true,
                      PaperProps: {
                        sx: {
                          maxHeight: 200,
                          zIndex: 9999
                        }
                      }
                    }}
                  >
                    {paxTypes.map((pax) => (
                      <MenuItem key={pax.paxID} value={pax.paxID}>
                        {pax.paxTitle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Visa Rate"
                  type="number"
                  value={editingRateVisa.rate}
                  onChange={(e) => handleEditInputChange('rate', e.target.value)}
                  size="small"
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: <Box sx={{ color: theme.palette.text.secondary, mr: 1 }}>$</Box>
                  }}
                  disabled={loading}
                  sx={{ mt: 1 }}
                  helperText="Enter the visa fee amount"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 1, mt: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Visa Rate Information:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption">Created:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(editingRateVisa.createdDT)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">Last Modified:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {editingRateVisa.modifyDT ? formatDate(editingRateVisa.modifyDT) : 'Never'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption">Current Rate:</Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${editingRateVisa.rate}
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
            onClick={saveEditedRateVisa}
            startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading || !editingRateVisa?.paxid || !editingRateVisa?.rate}
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RateVisaManagement;
