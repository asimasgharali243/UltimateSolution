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
  LocationCity as CityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Import RTK Query hooks
import {
  useGetCitiesQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
  useCheckCityNameExistsQuery
} from '../../../store/api/cityApi';

// Import auth selector to get current user
import { useSelector } from 'react-redux';

const CityManagement = () => {
  const theme = useTheme();

  // Get current user from Redux store
  const currentUser = useSelector((state) => state.auth.user);

  // RTK Query hooks
  const { data: cities = [], isLoading: citiesLoading, error: citiesError, refetch: refetchCities } = useGetCitiesQuery();

  const [createCity, { isLoading: creatingCity }] = useCreateCityMutation();
  const [updateCity, { isLoading: updatingCity }] = useUpdateCityMutation();
  const [deleteCity, { isLoading: deletingCity }] = useDeleteCityMutation();

  // Local state
  const [newCity, setNewCity] = useState({
    cityName: '',
    CreatedBy: 1 // This would typically come from logged in user
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check city name availability - FIXED: Only call when city name is valid
  const {
    data: nameCheckResult,
    isFetching: nameChecking,
    error: nameCheckError
  } = useCheckCityNameExistsQuery(newCity.cityName, {
    skip: !newCity.cityName || newCity.cityName.trim().length < 2
  });

  // Combined loading state
  const loading = citiesLoading || creatingCity || updatingCity || deletingCity;

  // Handle errors
  useEffect(() => {
    if (citiesError) {
      setMessage({
        type: 'error',
        text: citiesError.data?.message || citiesError.error || 'Failed to load cities'
      });
    }
  }, [citiesError]);

  // Get current user ID safely
  const getCurrentUserId = useCallback(() => {
    return currentUser?.userID || currentUser?.id || 1; // Fallback if user not available
  }, [currentUser]);

  // Handle input changes for new city
  const handleNewCityChange = useCallback((field, value) => {
    console.log('record', nameCheckResult);
    setNewCity((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle input changes for editing city
  const handleEditCityChange = useCallback((field, value) => {
    setEditingCity((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);
  // Name validation helper text - FIXED
  const getNameHelperText = useCallback(() => {
    if (!newCity.cityName) return 'Enter city name';
    if (newCity.cityName.trim().length < 2) return 'City name must be at least 2 characters';
    if (nameChecking) return 'Checking availability...';

    // If API check is available and successful
    if (nameCheckResult && !nameCheckError) {
      // Handle both possible response structures
      const exists = nameCheckResult.exists !== undefined ? nameCheckResult.exists : nameCheckResult;

      return exists ? 'City name already exists' : 'City name is available';
    }

    // If API check failed, fallback to client-side check
    if (nameCheckError) {
      const isDuplicate = cities.some((city) => city.cityName.toLowerCase() === newCity.cityName.trim().toLowerCase());
      return isDuplicate ? 'City name already exists (local check)' : 'City name appears available (local check)';
    }

    return 'Enter city name to check availability';
  }, [newCity.cityName, nameChecking, nameCheckError, nameCheckResult, cities]);

  // Name validation error state - FIXED
  const getNameError = useCallback(() => {
    if (!newCity.cityName || newCity.cityName.trim().length < 2) {
      return false;
    }

    // If API check is available and successful
    if (nameCheckResult && !nameCheckError) {
      // Handle both possible response structures
      const exists = nameCheckResult.exists !== undefined ? nameCheckResult.exists : nameCheckResult;
      return exists;
    }

    // If API check failed, fallback to client-side check
    if (nameCheckError) {
      return cities.some((city) => city.cityName.toLowerCase() === newCity.cityName.trim().toLowerCase());
    }

    // While checking or no data, assume no error
    return false;
  }, [newCity.cityName, nameCheckResult, nameCheckError, cities]);

  // Check if add button should be disabled - FIXED
  const isAddButtonDisabled = useMemo(() => {
    return loading || !newCity.cityName.trim() || newCity.cityName.trim().length < 2 || getNameError() || nameChecking;
  }, [loading, newCity.cityName, getNameError, nameChecking]);

  // Add new city - FIXED
  const handleAddCity = async () => {
    const trimmedCityName = newCity.cityName.trim();

    if (!trimmedCityName) {
      setMessage({ type: 'error', text: 'City name is required' });
      return;
    }

    if (trimmedCityName.length < 2) {
      setMessage({ type: 'error', text: 'City name must be at least 2 characters' });
      return;
    }

    // Final duplicate check before submitting
    const isDuplicate = cities.some((city) => city.cityName.toLowerCase() === trimmedCityName.toLowerCase());

    if (isDuplicate) {
      setMessage({ type: 'error', text: `City with name '${trimmedCityName}' already exists` });
      return;
    }

    try {
      await createCity({
        cityName: trimmedCityName,
        CreatedBy: getCurrentUserId()
      }).unwrap();

      setNewCity({
        cityName: '',
        CreatedBy: getCurrentUserId()
      });
      setMessage({ type: 'success', text: 'City added successfully!' });

      // Refetch cities to get updated list
      refetchCities();
    } catch (error) {
      console.error('Create city error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to add city';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Edit city - FIXED
  const openEditDialog = useCallback((city) => {
    setEditingCity({ ...city });
    setEditDialogOpen(true);
  }, []);

  const handleSaveEditedCity = async () => {
    const trimmedCityName = editingCity.cityName.trim();

    if (!trimmedCityName) {
      setMessage({ type: 'error', text: 'City name is required' });
      return;
    }

    if (trimmedCityName.length < 2) {
      setMessage({ type: 'error', text: 'City name must be at least 2 characters' });
      return;
    }

    // Check for duplicate name (excluding current city)
    const isDuplicate = cities.some(
      (city) => city.cityID !== editingCity.cityID && city.cityName.toLowerCase() === trimmedCityName.toLowerCase()
    );

    if (isDuplicate) {
      setMessage({ type: 'error', text: `City with name '${trimmedCityName}' already exists` });
      return;
    }

    try {
      await updateCity({
        id: editingCity.cityID,
        data: {
          cityID: editingCity.cityID,
          cityName: trimmedCityName,
          CreatedBy: editingCity.CreatedBy,
          CreatedDT: editingCity.CreatedDT,
          ModifyBy: getCurrentUserId(),
          ModifyDT: new Date().toISOString()
        }
      }).unwrap();

      setEditDialogOpen(false);
      setEditingCity(null);
      setMessage({ type: 'success', text: 'City updated successfully!' });

      // Refetch cities to get updated list
      refetchCities();
    } catch (error) {
      console.error('Update city error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to update city';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Delete city
  const handleDeleteCity = async (id) => {
    if (!window.confirm('Are you sure you want to delete this city?')) {
      return;
    }

    try {
      await deleteCity(id).unwrap();
      setMessage({ type: 'success', text: 'City deleted successfully!' });

      // Refetch cities to get updated list
      refetchCities();
    } catch (error) {
      console.error('Delete city error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to delete city';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '-';
    }
  }, []);

  // Table cell styles
  const tableCellStyles = useMemo(
    () => ({
      whiteSpace: 'nowrap',
      overflow: 'visible',
      textOverflow: 'clip',
      padding: '12px 16px'
    }),
    []
  );

  // Clear message after 5 seconds
  useEffect(() => {
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
          <CityIcon sx={{ fontSize: 'inherit' }} />
          CITY MANAGEMENT
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Print City List">
            <IconButton color="secondary" sx={{ border: `1px solid ${theme.palette.secondary.main}` }}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Data">
            <IconButton color="success" sx={{ border: `1px solid ${theme.palette.success.main}` }}>
              <EmailIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Cities">
            <IconButton
              color="primary"
              sx={{ border: `1px solid ${theme.palette.primary.main}` }}
              onClick={refetchCities}
              disabled={loading}
            >
              <RefreshIcon />
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
        {citiesError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
            {citiesError.data?.message || 'Failed to load cities'}
          </Alert>
        )}

        {/* Add New City Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              Add New City
            </Typography>

            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              {/* City Name */}
              <Grid item xs={12} sm={8} md={6}>
                <TextField
                  fullWidth
                  label="City Name"
                  value={newCity.cityName}
                  onChange={(e) => handleNewCityChange('cityName', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isAddButtonDisabled) {
                      handleAddCity();
                    }
                  }}
                  size="small"
                  variant="outlined"
                  placeholder="Enter unique city name..."
                  disabled={loading}
                  error={getNameError()}
                  helperText={getNameHelperText()}
                  sx={{
                    '& .MuiFormHelperText-root': {
                      color: getNameError()
                        ? theme.palette.error.main
                        : newCity.cityName && !getNameError() && !nameChecking
                          ? theme.palette.success.main
                          : 'inherit'
                    }
                  }}
                />
              </Grid>

              {/* Add Button */}
              <Grid item xs={12} sm={4} md={6}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                  <Button
                    variant="contained"
                    startIcon={creatingCity ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    onClick={handleAddCity}
                    disabled={isAddButtonDisabled}
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
                    {creatingCity ? 'Adding...' : 'Add City'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Cities List Card */}
        <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                Cities List
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Cities: {cities.length}
              </Typography>
            </Box>

            {citiesLoading ? (
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
                        { header: 'City ID', width: '100px' },
                        { header: 'City Name', width: '200px' },
                        { header: 'Created By', width: '120px' },
                        { header: 'Created Date', width: '150px' },
                        { header: 'Modified By', width: '120px' },
                        { header: 'Modified Date', width: '150px' },
                        // { header: 'Status', width: '120px' },
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
                    {cities.map((city) => (
                      <TableRow
                        key={city.cityID}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                          '&:hover': { backgroundColor: theme.palette.action.selected }
                        }}
                      >
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            #{city.cityID}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body1" fontWeight="medium">
                            {city.cityName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">User {city.createdBy}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{formatDate(city.createdDT)}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{city.modifyBy ? `User ${city.modifyBy}` : '-'}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{formatDate(city.modifyDT)}</Typography>
                        </TableCell>
                        {/* <TableCell sx={tableCellStyles}>
                          <Chip
                            label="Active"
                            color="success"
                            variant="filled"
                            size="small"
                            sx={{ fontWeight: 'bold', minWidth: '80px' }}
                          />
                        </TableCell> */}
                        <TableCell sx={tableCellStyles}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit City">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openEditDialog(city)}
                                sx={{ borderRadius: 1 }}
                                disabled={loading}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete City">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteCity(city.cityID)}
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
                      <TableCell colSpan={8} align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
                        Total Cities: {cities.length} | Last Updated:{' '}
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

            {cities.length === 0 && !citiesLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CityIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No cities found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add your first city using the form above.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Paper>

      {/* Edit City Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            position: 'relative',
            zIndex: 1
          }}
        >
          <EditIcon />
          Edit City
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {editingCity && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="City Name"
                  value={editingCity.cityName}
                  onChange={(e) => handleEditCityChange('cityName', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEditedCity();
                    }
                  }}
                  size="small"
                  variant="outlined"
                  disabled={loading}
                  sx={{ mt: 1 }}
                  helperText="Enter a unique city name"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 1, mt: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    City Information:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption">Created:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(editingCity.createdDT)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">Last Modified:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {editingCity.modifyDT ? formatDate(editingCity.modifyDT) : 'Never'}
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
            onClick={handleSaveEditedCity}
            startIcon={updatingCity ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading || !editingCity?.cityName.trim() || editingCity.cityName.trim().length < 2}
          >
            {updatingCity ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CityManagement;
