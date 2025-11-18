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
  Hotel as HotelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Import RTK Query hooks
import {
  useGetRateHotelsQuery,
  useCreateRateHotelMutation,
  useUpdateRateHotelMutation,
  useDeleteRateHotelMutation,
  useGetRateHotelByCompositeQuery
} from '../../../store/api/rateHotelApi';

import { useGetCitiesQuery } from '../../../store/api/cityApi';
import { useGetHotelsQuery } from '../../../store/api/hotelApi';

// Import auth selector to get current user
import { useSelector } from 'react-redux';

const RateHotelManagement = () => {
  const theme = useTheme();

  // Get current user from Redux store
  const currentUser = useSelector((state) => state.auth.user);

  // RTK Query hooks
  const {
    data: rateHotels = [],
    isLoading: rateHotelsLoading,
    error: rateHotelsError,
    refetch: refetchRateHotels
  } = useGetRateHotelsQuery();
  const { data: cities = [], isLoading: citiesLoading } = useGetCitiesQuery();
  const { data: hotels = [], isLoading: hotelsLoading } = useGetHotelsQuery();

  const [createRateHotel, { isLoading: creatingRateHotel }] = useCreateRateHotelMutation();
  const [updateRateHotel, { isLoading: updatingRateHotel }] = useUpdateRateHotelMutation();
  const [deleteRateHotel, { isLoading: deletingRateHotel }] = useDeleteRateHotelMutation();

  // Local state
  const [newRateHotel, setNewRateHotel] = useState({
    cityID: '',
    hotelID: '',
    Locations: '',
    Distance: '',
    sharing: 0,
    quint: 0,
    quad: 0,
    triple: 0,
    doble: 0
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRateHotel, setEditingRateHotel] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filter hotels by selected city
  const filteredHotels = useMemo(() => {
    if (!newRateHotel.cityID) return [];
    return hotels.filter((hotel) => parseInt(hotel.cityID) === parseInt(newRateHotel.cityID));
  }, [newRateHotel.cityID, hotels]);

  // Combined loading state
  const loading = rateHotelsLoading || citiesLoading || hotelsLoading || creatingRateHotel || updatingRateHotel || deletingRateHotel;

  // Handle errors
  useEffect(() => {
    if (rateHotelsError) {
      setMessage({
        type: 'error',
        text: rateHotelsError.data?.message || rateHotelsError.error || 'Failed to load hotel rates'
      });
    }
  }, [rateHotelsError]);

  // Handle input changes for new rate hotel
  const handleNewRateHotelChange = useCallback((field, value) => {
    setNewRateHotel((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle input changes for editing rate hotel
  const handleEditRateHotelChange = useCallback((field, value) => {
    setEditingRateHotel((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Check if add button should be disabled
  const isAddButtonDisabled = useMemo(() => {
    const locations = newRateHotel.Locations || '';
    const distance = newRateHotel.Distance || '';
    return loading || !newRateHotel.cityID || !newRateHotel.hotelID || !locations.trim() || !distance.trim();
  }, [loading, newRateHotel.cityID, newRateHotel.hotelID, newRateHotel.Locations, newRateHotel.Distance]);

  // Add new rate hotel
  const handleAddRateHotel = async () => {
    try {
      const rateHotelData = {
        cityID: parseInt(newRateHotel.cityID),
        hotelID: parseInt(newRateHotel.hotelID),
        Locations: (newRateHotel.Locations || '').trim(),
        Distance: (newRateHotel.Distance || '').trim(),
        sharing: parseInt(newRateHotel.sharing) || 0,
        quint: parseInt(newRateHotel.quint) || 0,
        quad: parseInt(newRateHotel.quad) || 0,
        triple: parseInt(newRateHotel.triple) || 0,
        doble: parseInt(newRateHotel.doble) || 0
      };

      await createRateHotel(rateHotelData).unwrap();

      // Reset form
      setNewRateHotel({
        cityID: '',
        hotelID: '',
        Locations: '',
        Distance: '',
        sharing: 0,
        quint: 0,
        quad: 0,
        triple: 0,
        doble: 0
      });

      setMessage({ type: 'success', text: 'Hotel rate added successfully!' });
      refetchRateHotels();
    } catch (error) {
      console.error('Create rate hotel error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to add hotel rate';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Edit rate hotel - FIXED: Handle property name mismatch
  const openEditDialog = useCallback((rateHotel) => {
    // Normalize the rate hotel data to handle property name inconsistencies
    const normalizedRateHotel = {
      ...rateHotel,
      // Handle both 'Locations' and 'locations' properties
      Locations: rateHotel.Locations || rateHotel.locations || '',
      // Handle both 'Distance' and 'distance' properties
      Distance: rateHotel.Distance || rateHotel.distance || '',
      // Ensure all numeric fields have proper values
      sharing: rateHotel.sharing || 0,
      quint: rateHotel.quint || 0,
      quad: rateHotel.quad || 0,
      triple: rateHotel.triple || 0,
      doble: rateHotel.doble || 0
    };

    setEditingRateHotel(normalizedRateHotel);
    setEditDialogOpen(true);
  }, []);

  const handleSaveEditedRateHotel = async () => {
    try {
      const rateHotelData = {
        cityID: parseInt(editingRateHotel.cityID),
        hotelID: parseInt(editingRateHotel.hotelID),
        Locations: (editingRateHotel.Locations || '').trim(),
        Distance: (editingRateHotel.Distance || '').trim(),
        sharing: parseInt(editingRateHotel.sharing) || 0,
        quint: parseInt(editingRateHotel.quint) || 0,
        quad: parseInt(editingRateHotel.quad) || 0,
        triple: parseInt(editingRateHotel.triple) || 0,
        doble: parseInt(editingRateHotel.doble) || 0
      };

      await updateRateHotel({
        id: editingRateHotel.id,
        ...rateHotelData
      }).unwrap();

      setEditDialogOpen(false);
      setEditingRateHotel(null);
      setMessage({ type: 'success', text: 'Hotel rate updated successfully!' });
      refetchRateHotels();
    } catch (error) {
      console.error('Update rate hotel error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to update hotel rate';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Delete rate hotel
  const handleDeleteRateHotel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotel rate?')) {
      return;
    }

    try {
      await deleteRateHotel(id).unwrap();
      setMessage({ type: 'success', text: 'Hotel rate deleted successfully!' });
      refetchRateHotels();
    } catch (error) {
      console.error('Delete rate hotel error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to delete hotel rate';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK').format(amount);
  };

  // Get city name by ID
  const getCityName = (cityID) => {
    const city = cities.find((c) => parseInt(c.cityID) === parseInt(cityID));
    return city ? city.cityName : 'Unknown';
  };

  // Get hotel name by ID
  const getHotelName = (hotelID) => {
    const hotel = hotels.find((h) => parseInt(h.hotelID) === parseInt(hotelID));
    return hotel ? hotel.hotelName : 'Unknown';
  };

  // Get locations for display - FIXED: Handle both property names
  const getLocations = (rateHotel) => {
    return rateHotel.Locations || rateHotel.locations || 'N/A';
  };

  // Get distance for display - FIXED: Handle both property names
  const getDistance = (rateHotel) => {
    return rateHotel.Distance || rateHotel.distance || 'N/A';
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
          <HotelIcon sx={{ fontSize: 'inherit' }} />
          HOTEL RATE MANAGEMENT
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Refresh Rates">
            <IconButton
              color="primary"
              sx={{ border: `1px solid ${theme.palette.primary.main}` }}
              onClick={refetchRateHotels}
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

        {/* Add New Rate Hotel Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              Add New Hotel Rate
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* City Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>City</InputLabel>
                  <Select
                    value={newRateHotel.cityID}
                    label="City"
                    onChange={(e) => handleNewRateHotelChange('cityID', e.target.value)}
                    disabled={citiesLoading}
                  >
                    <MenuItem value="">Select City</MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.cityID} value={city.cityID}>
                        {city.cityName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Hotel Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Hotel</InputLabel>
                  <Select
                    value={newRateHotel.hotelID}
                    label="Hotel"
                    onChange={(e) => handleNewRateHotelChange('hotelID', e.target.value)}
                    disabled={!newRateHotel.cityID || hotelsLoading}
                  >
                    <MenuItem value="">Select Hotel</MenuItem>
                    {filteredHotels.map((hotel) => (
                      <MenuItem key={hotel.hotelID} value={hotel.hotelID}>
                        {hotel.hotelName} ({hotel.hotalType})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Locations and Distance */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Locations"
                  value={newRateHotel.Locations}
                  onChange={(e) => handleNewRateHotelChange('Locations', e.target.value)}
                  size="small"
                  placeholder="e.g., Haram View, City Center"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Distance"
                  value={newRateHotel.Distance}
                  onChange={(e) => handleNewRateHotelChange('Distance', e.target.value)}
                  size="small"
                  placeholder="e.g., 200m from Haram"
                />
              </Grid>

              {/* Room Rates */}
              {['sharing', 'quint', 'quad', 'triple', 'doble'].map((roomType) => (
                <Grid item xs={12} sm={6} md={2.4} key={roomType}>
                  <TextField
                    fullWidth
                    label={roomType.toUpperCase()}
                    type="number"
                    value={newRateHotel[roomType]}
                    onChange={(e) => handleNewRateHotelChange(roomType, e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: <Typography variant="caption">Rs.</Typography>
                    }}
                  />
                </Grid>
              ))}

              {/* Add Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={creatingRateHotel ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    onClick={handleAddRateHotel}
                    disabled={isAddButtonDisabled}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      minWidth: '140px'
                    }}
                  >
                    {creatingRateHotel ? 'Adding...' : 'Add Rate'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Rate Hotels List Card */}
        <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                Hotel Rates List
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Rates: {rateHotels.length}
              </Typography>
            </Box>

            {rateHotelsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', borderRadius: 1 }}>
                <Table size="small" sx={{ minWidth: 1000 }}>
                  <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableRow>
                      {['ID', 'City', 'Hotel', 'Locations', 'Distance', 'Sharing', 'Quint', 'Quad', 'Triple', 'Double', 'Actions'].map(
                        (header) => (
                          <TableCell key={header} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {header}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rateHotels.map((rate) => (
                      <TableRow
                        key={rate.id}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                          '&:hover': { backgroundColor: theme.palette.action.selected }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            #{rate.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {getCityName(rate.cityID)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{getHotelName(rate.hotelID)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{getLocations(rate)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{getDistance(rate)}</Typography>
                        </TableCell>
                        {/* Room Rates */}
                        {['sharing', 'quint', 'quad', 'triple', 'doble'].map((roomType) => (
                          <TableCell key={roomType}>
                            <Chip
                              label={formatCurrency(rate[roomType])}
                              color="primary"
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 'bold', minWidth: '80px' }}
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Rate">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openEditDialog(rate)}
                                sx={{ borderRadius: 1 }}
                                disabled={loading}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Rate">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteRateHotel(rate.id)}
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
                      <TableCell colSpan={11} align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}>
                        Total Hotel Rates: {rateHotels.length}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            )}

            {rateHotels.length === 0 && !rateHotelsLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <HotelIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No hotel rates found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add your first hotel rate using the form above.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Paper>

      {/* Edit Rate Hotel Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
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
          Edit Hotel Rate
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {editingRateHotel && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <InputLabel>City</InputLabel>
                  <Select
                    value={editingRateHotel.cityID}
                    label="City"
                    onChange={(e) => handleEditRateHotelChange('cityID', e.target.value)}
                  >
                    {cities.map((city) => (
                      <MenuItem key={city.cityID} value={city.cityID}>
                        {city.cityName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <InputLabel>Hotel</InputLabel>
                  <Select
                    value={editingRateHotel.hotelID}
                    label="Hotel"
                    onChange={(e) => handleEditRateHotelChange('hotelID', e.target.value)}
                  >
                    {hotels
                      .filter((h) => parseInt(h.cityID) === parseInt(editingRateHotel.cityID))
                      .map((hotel) => (
                        <MenuItem key={hotel.hotelID} value={hotel.hotelID}>
                          {hotel.hotelName} ({hotel.hotalType})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Locations"
                  value={editingRateHotel.Locations || ''}
                  onChange={(e) => handleEditRateHotelChange('Locations', e.target.value)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Distance"
                  value={editingRateHotel.Distance || ''}
                  onChange={(e) => handleEditRateHotelChange('Distance', e.target.value)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Grid>

              {/* Room Rates in Edit Dialog */}
              {['sharing', 'quint', 'quad', 'triple', 'doble'].map((roomType) => (
                <Grid item xs={12} sm={6} md={2.4} key={roomType}>
                  <TextField
                    fullWidth
                    label={roomType.toUpperCase()}
                    type="number"
                    value={editingRateHotel[roomType] || 0}
                    onChange={(e) => handleEditRateHotelChange(roomType, e.target.value)}
                    size="small"
                    sx={{ mt: 1 }}
                    InputProps={{
                      startAdornment: <Typography variant="caption">Rs.</Typography>
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: theme.palette.text.secondary }} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEditedRateHotel}
            startIcon={updatingRateHotel ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading || !(editingRateHotel?.Locations || '').trim() || !(editingRateHotel?.Distance || '').trim()}
          >
            {updatingRateHotel ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RateHotelManagement;
