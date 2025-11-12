// src/views/Dashboard/Sectors/SectorManagement.jsx
import React, { useState, useCallback, useMemo } from 'react';
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
  Switch,
  FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Public as SectorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// RTK Query hooks
import {
  useGetSectorsQuery,
  useCreateSectorMutation,
  useUpdateSectorMutation,
  usePatchSectorMutation,
  useDeleteSectorMutation,
  useCheckSectorNameExistsQuery
} from 'store/api/sectorApi';

// Import auth selector to get current user
import { useSelector } from 'react-redux';

// Fixed SectorRow component with proper field mapping
const SectorRow = React.memo(({ sector, onToggleStatus, onEdit, onDelete, toggleLoading, theme, formatDate }) => {
  // FIXED: Use the correct field names from backend response
  const isActive = Boolean(sector.active);
  const sectorId = sector.sectorID;
  const sectorName = sector.sectorName;
  const createdBy = sector.createdBy;
  const createdDT = sector.createdDT;
  const modifyBy = sector.modifyBy;
  const modifyDT = sector.modifyDT;

  const getStatusColor = (active) => (active ? 'success' : 'error');
  const getStatusText = (active) => (active ? 'Active' : 'Inactive');

  const tableCellStyles = useMemo(
    () => ({
      whiteSpace: 'nowrap',
      overflow: 'visible',
      textOverflow: 'clip',
      padding: '12px 16px',
      verticalAlign: 'middle'
    }),
    []
  );

  const handleToggle = useCallback(
    (e) => {
      e.stopPropagation();
      onToggleStatus(sector);
    },
    [sector, onToggleStatus]
  );

  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation();
      onEdit(sector);
    },
    [sector, onEdit]
  );

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      onDelete(sector.sectorID);
    },
    [sector.sectorID, onDelete]
  );

  return (
    <TableRow
      sx={{
        '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
        '&:hover': { backgroundColor: theme.palette.action.selected }
      }}
    >
      <TableCell sx={tableCellStyles}>
        <Typography variant="body2" fontWeight="bold" color="primary">
          #{sectorId}
        </Typography>
      </TableCell>
      <TableCell sx={tableCellStyles}>
        <Typography variant="body1" fontWeight="medium">
          {sectorName}
        </Typography>
      </TableCell>
      <TableCell sx={tableCellStyles}>
        <Chip
          label={getStatusText(isActive)}
          color={getStatusColor(isActive)}
          variant="filled"
          size="small"
          sx={{ fontWeight: 'bold', minWidth: '100px' }}
        />
      </TableCell>
      <TableCell sx={tableCellStyles}>
        <Typography variant="body2">User {createdBy || 'System'}</Typography>
      </TableCell>
      <TableCell sx={tableCellStyles}>
        <Typography variant="body2">{formatDate(createdDT)}</Typography>
      </TableCell>
      <TableCell sx={tableCellStyles}>
        <Typography variant="body2">{modifyBy ? `User ${modifyBy}` : '-'}</Typography>
      </TableCell>
      <TableCell sx={tableCellStyles}>
        <Typography variant="body2">{formatDate(modifyDT)}</Typography>
      </TableCell>

      <TableCell
        sx={{
          verticalAlign: 'middle',
          textAlign: 'center',
          padding: '8px 12px'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            flexWrap: 'nowrap',
            height: '100%'
          }}
        >
          {/* FIXED: Switch with proper boolean handling */}
          <Tooltip title={isActive ? 'Deactivate Sector' : 'Activate Sector'}>
            <Box component="span" sx={{ display: 'inline-flex' }}>
              <Switch
                size="small"
                checked={isActive}
                onChange={handleToggle}
                color="success"
                disabled={toggleLoading}
                sx={{
                  transform: 'scale(0.9)',
                  mx: 1,
                  '& .MuiSwitch-thumb': {
                    width: 14,
                    height: 14
                  },
                  '& .MuiSwitch-switchBase': {
                    padding: 0.5
                  }
                }}
              />
            </Box>
          </Tooltip>

          <Tooltip title="Edit Sector">
            <Box component="span" sx={{ display: 'inline-flex' }}>
              <IconButton size="small" color="primary" onClick={handleEdit} disabled={toggleLoading}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>

          <Tooltip title="Delete Sector">
            <Box component="span" sx={{ display: 'inline-flex' }}>
              <IconButton size="small" color="error" onClick={handleDelete} disabled={toggleLoading}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
});

const SectorManagement = React.memo(() => {
  const theme = useTheme();

  // Get current user from Redux store
  const currentUser = useSelector((state) => state.auth.user);

  // RTK Query hooks
  const { data: sectors = [], isLoading: sectorsLoading, error: sectorsError, refetch } = useGetSectorsQuery();

  const [createSector, { isLoading: creatingSector }] = useCreateSectorMutation();
  const [updateSector, { isLoading: updatingSector }] = useUpdateSectorMutation();
  const [patchSector, { isLoading: patchingSector }] = usePatchSectorMutation();
  const [deleteSector, { isLoading: deletingSector }] = useDeleteSectorMutation();

  // Local state
  const [formData, setFormData] = useState({
    sectorName: '',
    active: true // FIXED: Changed to lowercase to match backend
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check sector name availability
  const {
    data: nameCheckResult,
    isFetching: nameChecking,
    error: nameCheckError
  } = useCheckSectorNameExistsQuery(formData.sectorName, {
    skip: !formData.sectorName || formData.sectorName.length < 2
  });

  // Handle input changes for new sector
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle input changes for editing sector
  const handleEditInputChange = useCallback((field, value) => {
    setEditingSector((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Get current user ID safely
  const getCurrentUserId = useCallback(() => {
    return currentUser?.userID || currentUser?.id || 1; // Fallback if user not available
  }, [currentUser]);

  // Add new sector
  const addSector = useCallback(async () => {
    if (!formData.sectorName.trim()) {
      setMessage({ type: 'error', text: 'Sector name is required' });
      return;
    }

    if (formData.sectorName.length < 2) {
      setMessage({ type: 'error', text: 'Sector name must be at least 2 characters' });
      return;
    }

    // Use API validation if available, otherwise client-side check
    let isDuplicate = false;

    if (nameCheckResult && nameCheckResult.exists) {
      isDuplicate = true;
    } else {
      // Fallback to client-side check
      isDuplicate = sectors.some((sector) => sector.sectorName.toLowerCase() === formData.sectorName.trim().toLowerCase());
    }

    if (isDuplicate) {
      setMessage({ type: 'error', text: `Sector with name '${formData.sectorName}' already exists` });
      return;
    }

    try {
      // FIXED: Use lowercase field names to match backend
      const sectorData = {
        sectorName: formData.sectorName.trim(),
        active: Boolean(formData.active),
        createdBy: getCurrentUserId()
      };

      await createSector(sectorData).unwrap();
      setFormData({
        sectorName: '',
        active: true
      });
      setMessage({ type: 'success', text: 'Sector added successfully!' });
    } catch (error) {
      console.error('Create sector error:', error);
      const errorMessage = error.data?.message || error.data?.title || 'Failed to add sector';
      setMessage({ type: 'error', text: errorMessage });
    }
  }, [formData, createSector, sectors, nameCheckResult, getCurrentUserId]);

  // Edit sector
  const openEditDialog = useCallback((sector) => {
    // FIXED: Use correct field names from backend
    setEditingSector({
      ...sector,
      active: Boolean(sector.active)
    });
    setEditDialogOpen(true);
  }, []);

  const saveEditedSector = useCallback(async () => {
    if (!editingSector?.sectorName.trim()) {
      setMessage({ type: 'error', text: 'Sector name is required' });
      return;
    }

    if (editingSector.sectorName.length < 2) {
      setMessage({ type: 'error', text: 'Sector name must be at least 2 characters' });
      return;
    }

    // Check for duplicate name (excluding current sector)
    const isDuplicate = sectors.some(
      (sector) =>
        sector.sectorID !== editingSector.sectorID && sector.sectorName.toLowerCase() === editingSector.sectorName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setMessage({ type: 'error', text: `Sector with name '${editingSector.sectorName}' already exists` });
      return;
    }

    try {
      // FIXED: Use lowercase field names to match backend
      await updateSector({
        id: editingSector.sectorID,
        data: {
          sectorID: editingSector.sectorID,
          sectorName: editingSector.sectorName.trim(),
          active: Boolean(editingSector.active),
          modifyBy: getCurrentUserId()
        }
      }).unwrap();

      setEditDialogOpen(false);
      setEditingSector(null);
      setMessage({ type: 'success', text: 'Sector updated successfully!' });
    } catch (error) {
      console.error('Update sector error:', error);
      const errorMessage = error.data?.message || error.data?.title || 'Failed to update sector';
      setMessage({ type: 'error', text: errorMessage });
    }
  }, [editingSector, updateSector, sectors, getCurrentUserId]);

  // Delete sector
  const handleDeleteSector = useCallback(
    async (id) => {
      if (!window.confirm('Are you sure you want to delete this sector? This action cannot be undone.')) {
        return;
      }

      try {
        await deleteSector(id).unwrap();
        setMessage({ type: 'success', text: 'Sector deleted successfully!' });
      } catch (error) {
        console.error('Delete sector error:', error);
        const errorMessage = error.data?.message || error.data?.title || 'Failed to delete sector';
        setMessage({ type: 'error', text: errorMessage });
      }
    },
    [deleteSector]
  );

  // FIXED: Toggle sector status with proper field names
  const handleToggleSectorStatus = useCallback(
    async (sector) => {
      const newActiveStatus = !sector.active;

      try {
        await patchSector({
          id: sector.sectorID,
          data: {
            active: newActiveStatus, // FIXED: Use lowercase
            modifyBy: getCurrentUserId()
          }
        }).unwrap();

        setMessage({
          type: 'success',
          text: `Sector ${newActiveStatus ? 'activated' : 'deactivated'} successfully!`
        });

        // Refresh the data to ensure UI is in sync
        refetch();
      } catch (error) {
        console.error('Toggle sector status error:', error);
        const errorMessage = error.data?.message || error.data?.title || 'Failed to update sector status';
        setMessage({ type: 'error', text: errorMessage });
      }
    },
    [patchSector, getCurrentUserId, refetch]
  );

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  }, []);

  // Name validation helper text
  const getNameHelperText = useCallback(() => {
    if (!formData.sectorName) return 'Enter sector name';
    if (formData.sectorName.length < 2) return 'Sector name must be at least 2 characters';
    if (nameChecking) return 'Checking availability...';
    if (nameCheckError) return 'Name check unavailable';

    // Use API result if available
    if (nameCheckResult) {
      return nameCheckResult.exists ? 'Sector name already exists' : 'Sector name is available';
    }

    // Fallback to client-side check
    const isDuplicate = sectors.some((sector) => sector.sectorName.toLowerCase() === formData.sectorName.trim().toLowerCase());

    return isDuplicate ? 'Sector name already exists' : 'Sector name is available';
  }, [formData.sectorName, nameChecking, nameCheckError, nameCheckResult, sectors]);

  const getNameError = useCallback(() => {
    if (!formData.sectorName) return false;

    // Use API result if available
    if (nameCheckResult) {
      return nameCheckResult.exists;
    }

    // Fallback to client-side check
    return sectors.some((sector) => sector.sectorName.toLowerCase() === formData.sectorName.trim().toLowerCase());
  }, [formData.sectorName, nameCheckResult, sectors]);

  // FIXED: Memoized statistics with correct field names
  const sectorStats = useMemo(() => {
    const activeCount = sectors.filter((s) => Boolean(s.active)).length;
    const inactiveCount = sectors.filter((s) => !Boolean(s.active)).length;
    return { activeCount, inactiveCount, total: sectors.length };
  }, [sectors]);

  // Memoized table headers
  const tableHeaders = useMemo(
    () => [
      { header: 'Sector ID', width: '100px' },
      { header: 'Sector Name', width: '200px' },
      { header: 'Status', width: '120px' },
      { header: 'Created By', width: '120px' },
      { header: 'Created Date', width: '150px' },
      { header: 'Modified By', width: '120px' },
      { header: 'Modified Date', width: '150px' },
      { header: 'Actions', width: '150px' }
    ],
    []
  );

  // Clear message after 5 seconds
  React.useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

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
          <SectorIcon sx={{ fontSize: 'inherit' }} />
          SECTOR MANAGEMENT
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Refresh Data">
            <IconButton
              color="primary"
              onClick={refetch}
              disabled={sectorsLoading}
              sx={{ border: `1px solid ${theme.palette.primary.main}` }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Sectors">
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

        {/* Error Alert */}
        {sectorsError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
            {sectorsError.data?.message || 'Failed to load sectors'}
          </Alert>
        )}

        {/* Add New Sector Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              Add New Sector
            </Typography>

            <Grid container spacing={3} alignItems="flex-end" sx={{ mt: 1 }}>
              {/* Sector Name */}
              <Grid item xs={12} sm={8} md={6}>
                <TextField
                  fullWidth
                  label="Sector Name"
                  value={formData.sectorName}
                  onChange={(e) => handleInputChange('sectorName', e.target.value)}
                  size="small"
                  variant="outlined"
                  required
                  placeholder="Enter unique sector name..."
                  disabled={creatingSector}
                  error={getNameError()}
                  helperText={getNameHelperText()}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSector();
                    }
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '40px'
                    },
                    '& .MuiFormHelperText-root': {
                      color: getNameError()
                        ? 'error.main'
                        : formData.sectorName && !getNameError() && !nameChecking
                          ? 'success.main'
                          : 'inherit'
                    }
                  }}
                />
              </Grid>

              {/* Active Status */}
              <Grid item xs={12} sm={4} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(formData.active)}
                      onChange={(e) => handleInputChange('active', e.target.checked)}
                      color="success"
                      disabled={creatingSector}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        color: formData.active ? theme.palette.success.main : theme.palette.text.secondary,
                        fontWeight: 'medium'
                      }}
                    >
                      {formData.active ? 'Active' : 'Inactive'}
                    </Typography>
                  }
                  sx={{ marginLeft: 0 }}
                />
              </Grid>

              {/* Add Button */}
              <Grid item xs={12} sm={12} md={3}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-start', md: 'flex-end' } }}>
                  <Button
                    variant="contained"
                    startIcon={creatingSector ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    onClick={addSector}
                    disabled={creatingSector || !formData.sectorName.trim() || getNameError() || nameChecking}
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
                    {creatingSector ? 'Adding...' : 'Add Sector'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Sectors List Card */}
        <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                Sectors List
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Sectors: {sectorStats.total} | Active: {sectorStats.activeCount}
              </Typography>
            </Box>

            {sectorsLoading ? (
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
                    padding: '12px 16px',
                    verticalAlign: 'middle'
                  }
                }}
              >
                <Table size="small" sx={{ minWidth: 800 }}>
                  <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableRow>
                      {tableHeaders.map((item, index) => (
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
                    {sectors.map((sector) => (
                      <SectorRow
                        key={sector.sectorID}
                        sector={sector}
                        onToggleStatus={handleToggleSectorStatus}
                        onEdit={openEditDialog}
                        onDelete={handleDeleteSector}
                        toggleLoading={patchingSector}
                        theme={theme}
                        formatDate={formatDate}
                      />
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell colSpan={8} align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
                        Total Sectors: {sectorStats.total} | Active: {sectorStats.activeCount} | Inactive: {sectorStats.inactiveCount} |
                        Last Updated:{' '}
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

            {sectors.length === 0 && !sectorsLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SectorIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No sectors found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add your first sector using the form above.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Paper>

      {/* Edit Sector Dialog */}
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
          Edit Sector
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {editingSector && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField
                fullWidth
                label="Sector Name"
                value={editingSector.sectorName || ''}
                onChange={(e) => handleEditInputChange('sectorName', e.target.value)}
                variant="outlined"
                required
                disabled={updatingSector}
                helperText="Enter a unique sector name"
                error={!editingSector.sectorName?.trim()}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(editingSector.active)}
                    onChange={(e) => handleEditInputChange('active', e.target.checked)}
                    color="success"
                    disabled={updatingSector}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{
                      color: editingSector.active ? theme.palette.success.main : theme.palette.text.secondary,
                      fontWeight: 'medium'
                    }}
                  >
                    {editingSector.active ? 'Active' : 'Inactive'}
                  </Typography>
                }
                sx={{ marginLeft: 0 }}
              />

              <Box sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Sector Information:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" display="block">
                      Created:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(editingSector.createdDT)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" display="block">
                      Last Modified:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {editingSector.modifyDT ? formatDate(editingSector.modifyDT) : 'Never'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" display="block">
                      Current Status:
                    </Typography>
                    <Chip
                      label={editingSector.active ? 'Active' : 'Inactive'}
                      color={editingSector.active ? 'success' : 'error'}
                      variant="filled"
                      size="small"
                      sx={{ fontWeight: 'bold', mt: 0.5 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)} disabled={updatingSector}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveEditedSector}
            startIcon={updatingSector ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={updatingSector || !editingSector?.sectorName?.trim()}
          >
            {updatingSector ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default SectorManagement;
