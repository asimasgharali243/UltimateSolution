// src/views/Dashboard/Hotels/HotelManagement.jsx
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
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
  Hotel as HotelIcon,
  Star as StarIcon
} from '@mui/icons-material';

// Import API hooks
import { useGetCitiesQuery } from '../../../store/api/cityApi';
import { useGetHotelsQuery, useCreateHotelMutation, useUpdateHotelMutation, useDeleteHotelMutation } from '../../../store/api/hotelApi';

const HotelManagement = () => {
  const theme = useTheme();

  // Get current user from Redux store
  const currentUser = useSelector((state) => state.auth.user);

  // State management
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [newHotel, setNewHotel] = useState({
    hotelName: '',
    hotalType: '',
    cityID: '',
    CreatedBy: currentUser?.userID || 1
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Hotel name validation states
  const [newHotelNameStatus, setNewHotelNameStatus] = useState({
    exists: false,
    checking: false,
    originalName: ''
  });
  const [editHotelNameStatus, setEditHotelNameStatus] = useState({
    exists: false,
    checking: false,
    originalName: ''
  });

  // Hotel types
  const hotelTypes = ['Economy', '3 Star', '4 Star', '5 Star', 'Luxury', 'Budget', 'Business'];

  // API Hooks
  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useGetCitiesQuery();
  const { data: hotelsData, isLoading: hotelsLoading, error: hotelsError, refetch: refetchHotels } = useGetHotelsQuery();
  const [createHotel, { isLoading: creatingHotel }] = useCreateHotelMutation();
  const [updateHotel, { isLoading: updatingHotel }] = useUpdateHotelMutation();
  const [deleteHotel, { isLoading: deletingHotel }] = useDeleteHotelMutation();

  // Load cities and hotels from API
  useEffect(() => {
    if (citiesData) {
      setCities(citiesData);
    }
    if (hotelsData) {
      setHotels(hotelsData);
    }
  }, [citiesData, hotelsData]);

  // Handle API errors
  useEffect(() => {
    if (citiesError) {
      setMessage({ type: 'error', text: 'Failed to load cities' });
    }
    if (hotelsError) {
      setMessage({ type: 'error', text: 'Failed to load hotels' });
    }
  }, [citiesError, hotelsError]);

  // Check if hotel name exists for NEW hotel
  const checkNewHotelNameExists = (hotelName) => {
    if (!hotelName.trim()) {
      setNewHotelNameStatus({ exists: false, checking: false, originalName: '' });
      return;
    }

    setNewHotelNameStatus((prev) => ({ ...prev, checking: true }));

    // Simulate API call delay for better UX
    setTimeout(() => {
      const exists = hotels.some((hotel) => hotel.hotelName.toLowerCase().trim() === hotelName.toLowerCase().trim());
      setNewHotelNameStatus({
        exists,
        checking: false,
        originalName: hotelName.trim()
      });
    }, 500);
  };

  // Check if hotel name exists for EDITING hotel
  const checkEditHotelNameExists = (hotelName, currentHotelId) => {
    if (!hotelName.trim()) {
      setEditHotelNameStatus({ exists: false, checking: false, originalName: '' });
      return;
    }

    setEditHotelNameStatus((prev) => ({ ...prev, checking: true }));

    // Simulate API call delay for better UX
    setTimeout(() => {
      const exists = hotels.some(
        (hotel) => hotel.hotelID !== currentHotelId && hotel.hotelName.toLowerCase().trim() === hotelName.toLowerCase().trim()
      );
      setEditHotelNameStatus({
        exists,
        checking: false,
        originalName: hotelName.trim()
      });
    }, 500);
  };

  // Handle input changes for new hotel
  const handleNewHotelChange = (field, value) => {
    setNewHotel((prev) => ({
      ...prev,
      [field]: value
    }));

    // Check hotel name existence when hotel name changes
    if (field === 'hotelName') {
      checkNewHotelNameExists(value);
    }
  };

  // Handle input changes for editing hotel
  const handleEditHotelChange = (field, value) => {
    setEditingHotel((prev) => ({
      ...prev,
      [field]: value
    }));

    // Check hotel name existence when hotel name changes during editing
    if (field === 'hotelName' && editingHotel) {
      checkEditHotelNameExists(value, editingHotel.hotelID);
    }
  };

  // Add new hotel
  const addHotel = async () => {
    if (!newHotel.hotelName.trim() || !newHotel.cityID || !newHotel.hotalType) {
      setMessage({ type: 'error', text: 'Hotel name, type and city are required' });
      return;
    }

    if (newHotelNameStatus.exists) {
      setMessage({ type: 'error', text: 'Hotel name already exists' });
      return;
    }

    if (newHotelNameStatus.checking) {
      setMessage({ type: 'error', text: 'Please wait while we check hotel name availability' });
      return;
    }

    // Get current user ID
    const currentUserId = currentUser?.userID;
    if (!currentUserId) {
      setMessage({ type: 'error', text: 'User not authenticated' });
      return;
    }

    setLoading(true);
    try {
      const hotelData = {
        hotelName: newHotel.hotelName.trim(),
        hotalType: newHotel.hotalType,
        cityID: parseInt(newHotel.cityID),
        CreatedBy: currentUserId
      };

      const result = await createHotel(hotelData).unwrap();

      setNewHotel({
        hotelName: '',
        hotalType: '',
        cityID: '',
        CreatedBy: currentUserId
      });
      setNewHotelNameStatus({ exists: false, checking: false, originalName: '' });
      setMessage({ type: 'success', text: 'Hotel added successfully!' });

      // Refresh hotels list
      refetchHotels();
    } catch (error) {
      console.error('Error adding hotel:', error);
      const errorMessage = error?.data?.message || 'Failed to add hotel';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Edit hotel
  const openEditDialog = (hotel) => {
    setEditingHotel({
      ...hotel,
      cityID: hotel.cityID.toString() // Ensure cityID is string for Select component
    });
    setEditHotelNameStatus({
      exists: false,
      checking: false,
      originalName: hotel.hotelName
    });
    setEditDialogOpen(true);
  };

  const saveEditedHotel = async () => {
    if (!editingHotel.hotelName.trim() || !editingHotel.cityID || !editingHotel.hotalType) {
      setMessage({ type: 'error', text: 'Hotel name, type and city are required' });
      return;
    }

    if (editHotelNameStatus.exists) {
      setMessage({ type: 'error', text: 'Hotel name already exists' });
      return;
    }

    if (editHotelNameStatus.checking) {
      setMessage({ type: 'error', text: 'Please wait while we check hotel name availability' });
      return;
    }

    // Get current user ID
    const currentUserId = currentUser?.userID;
    if (!currentUserId) {
      setMessage({ type: 'error', text: 'User not authenticated' });
      return;
    }

    setLoading(true);
    try {
      const hotelData = {
        hotelID: editingHotel.hotelID,
        hotelName: editingHotel.hotelName.trim(),
        hotalType: editingHotel.hotalType,
        cityID: parseInt(editingHotel.cityID),
        ModifyBy: currentUserId
      };

      await updateHotel({ id: editingHotel.hotelID, data: hotelData }).unwrap();

      setEditDialogOpen(false);
      setEditingHotel(null);
      setEditHotelNameStatus({ exists: false, checking: false, originalName: '' });
      setMessage({ type: 'success', text: 'Hotel updated successfully!' });

      // Refresh hotels list
      refetchHotels();
    } catch (error) {
      console.error('Error updating hotel:', error);
      const errorMessage = error?.data?.message || 'Failed to update hotel';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Delete hotel
  const deleteHotelHandler = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteHotel(id).unwrap();
      setMessage({ type: 'success', text: 'Hotel deleted successfully!' });

      // Refresh hotels list
      refetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      const errorMessage = error?.data?.message || 'Failed to delete hotel';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
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
    } catch (error) {
      return '-';
    }
  };

  // Get hotels count by city
  const getHotelsCountByCity = (cityName) => {
    return hotels.filter((hotel) => hotel.cityName === cityName).length;
  };

  // Get chip color for hotel type
  const getHotelTypeColor = (hotalType) => {
    switch (hotalType) {
      case '5 Star':
        return 'error';
      case '4 Star':
        return 'warning';
      case '3 Star':
        return 'info';
      case 'Economy':
        return 'success';
      case 'Luxury':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Get star icons for hotel type
  const renderStars = (hotalType) => {
    const stars = {
      '5 Star': 5,
      '4 Star': 4,
      '3 Star': 3,
      Economy: 1,
      Luxury: 5,
      Budget: 1,
      Business: 3
    };

    const starCount = stars[hotalType] || 0;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {Array.from({ length: starCount }, (_, i) => (
          <StarIcon key={i} sx={{ fontSize: 16, color: theme.palette.warning.main }} />
        ))}
      </Box>
    );
  };

  // Table cell styles
  const tableCellStyles = {
    whiteSpace: 'nowrap',
    overflow: 'visible',
    textOverflow: 'clip',
    padding: '12px 16px'
  };

  const isLoading = citiesLoading || hotelsLoading || loading;

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
          HOTEL MANAGEMENT
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Print Hotel List">
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

        {/* Add New Hotel Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              Add New Hotel
            </Typography>

            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              {/* Hotel Name */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Hotel Name"
                  value={newHotel.hotelName}
                  onChange={(e) => handleNewHotelChange('hotelName', e.target.value)}
                  size="small"
                  variant="outlined"
                  placeholder="Enter hotel name..."
                  disabled={isLoading}
                  error={newHotelNameStatus.exists}
                  helperText={
                    newHotelNameStatus.checking
                      ? 'Checking availability...'
                      : newHotelNameStatus.exists
                        ? 'Hotel name already exists'
                        : newHotel.hotelName.trim() && !newHotelNameStatus.exists
                          ? 'Hotel name is available'
                          : 'Enter a hotel name'
                  }
                  FormHelperTextProps={{
                    sx: {
                      color: newHotelNameStatus.exists
                        ? theme.palette.error.main
                        : newHotel.hotelName.trim() && !newHotelNameStatus.exists
                          ? theme.palette.success.main
                          : 'inherit'
                    }
                  }}
                />
              </Grid>

              {/* Hotel Type */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small" disabled={isLoading}>
                  <InputLabel>Hotel Type</InputLabel>
                  <Select value={newHotel.hotalType} label="Hotel Type" onChange={(e) => handleNewHotelChange('hotalType', e.target.value)}>
                    <MenuItem value="">
                      <em>Select hotel type</em>
                    </MenuItem>
                    {hotelTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.includes('Star') && <StarIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />}
                          {type}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* City Selection */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small" disabled={isLoading || citiesLoading}>
                  <InputLabel>City</InputLabel>
                  <Select value={newHotel.cityID} label="City" onChange={(e) => handleNewHotelChange('cityID', e.target.value)}>
                    <MenuItem value="">
                      <em>Select a city</em>
                    </MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.cityID} value={city.cityID}>
                        {city.cityName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Add Button */}
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Button
                    variant="contained"
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    onClick={addHotel}
                    disabled={
                      isLoading ||
                      !newHotel.hotelName.trim() ||
                      !newHotel.cityID ||
                      !newHotel.hotalType ||
                      newHotelNameStatus.exists ||
                      newHotelNameStatus.checking ||
                      !currentUser
                    }
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
                    {isLoading ? 'Adding...' : 'Add Hotel'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Hotels List Card */}
        <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                Hotels List
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Hotels: {hotels.length}
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
                <Table size="small" sx={{ minWidth: 900 }}>
                  <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableRow>
                      {[
                        { header: 'Hotel ID', width: '100px' },
                        { header: 'Hotel Name', width: '200px' },
                        { header: 'Hotel Type', width: '150px' },
                        { header: 'City', width: '120px' },
                        { header: 'Created By', width: '100px' },
                        { header: 'Created Date', width: '130px' },
                        { header: 'Modified By', width: '100px' },
                        { header: 'Modified Date', width: '130px' },
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
                    {hotels.map((hotel) => (
                      <TableRow
                        key={hotel.hotelID}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                          '&:hover': { backgroundColor: theme.palette.action.selected }
                        }}
                      >
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            #{hotel.hotelID}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body1" fontWeight="medium">
                            {hotel.hotelName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={hotel.hotalType}
                              color={getHotelTypeColor(hotel.hotalType)}
                              variant="filled"
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                            {renderStars(hotel.hotalType)}
                          </Box>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Chip
                            label={hotel.cityName || 'Unknown'}
                            color={
                              hotel.cityName === 'MAKKAH'
                                ? 'primary'
                                : hotel.cityName === 'MADINAH'
                                  ? 'secondary'
                                  : hotel.cityName === 'JEDDAH'
                                    ? 'success'
                                    : 'default'
                            }
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">User {hotel.createdBy}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{formatDate(hotel.createdDT)}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{hotel.modifyBy ? `User ${hotel.modifyBy}` : '-'}</Typography>
                        </TableCell>
                        <TableCell sx={tableCellStyles}>
                          <Typography variant="body2">{formatDate(hotel.modifyDT)}</Typography>
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
                            <Tooltip title="Edit Hotel">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openEditDialog(hotel)}
                                sx={{ borderRadius: 1 }}
                                disabled={isLoading}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Hotel">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteHotelHandler(hotel.hotelID)}
                                sx={{ borderRadius: 1 }}
                                disabled={isLoading}
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
                        Total Hotels: {hotels.length} | Makkah: {getHotelsCountByCity('MAKKAH')} | Madinah:{' '}
                        {getHotelsCountByCity('MADINAH')} | Jeddah: {getHotelsCountByCity('JEDDAH')} | Others:{' '}
                        {hotels.filter((hotel) => !['MAKKAH', 'MADINAH', 'JEDDAH'].includes(hotel.cityName)).length}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            )}

            {hotels.length === 0 && !isLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <HotelIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No hotels found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add your first hotel using the form above.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Paper>

      {/* Edit Hotel Dialog */}
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
          Edit Hotel
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {editingHotel && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hotel Name"
                  value={editingHotel.hotelName}
                  onChange={(e) => handleEditHotelChange('hotelName', e.target.value)}
                  size="small"
                  variant="outlined"
                  disabled={isLoading}
                  error={editHotelNameStatus.exists}
                  helperText={
                    editHotelNameStatus.checking
                      ? 'Checking availability...'
                      : editHotelNameStatus.exists
                        ? 'Hotel name already exists'
                        : editingHotel.hotelName.trim() && !editHotelNameStatus.exists
                          ? 'Hotel name is available'
                          : 'Enter a hotel name'
                  }
                  FormHelperTextProps={{
                    sx: {
                      color: editHotelNameStatus.exists
                        ? theme.palette.error.main
                        : editingHotel.hotelName.trim() && !editHotelNameStatus.exists
                          ? theme.palette.success.main
                          : 'inherit'
                    }
                  }}
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small" disabled={isLoading}>
                  <InputLabel>Hotel Type</InputLabel>
                  <Select
                    value={editingHotel.hotalType}
                    label="Hotel Type"
                    onChange={(e) => handleEditHotelChange('hotalType', e.target.value)}
                  >
                    {hotelTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.includes('Star') && <StarIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />}
                          {type}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small" disabled={isLoading}>
                  <InputLabel>City</InputLabel>
                  <Select value={editingHotel.cityID} label="City" onChange={(e) => handleEditHotelChange('cityID', e.target.value)}>
                    {cities.map((city) => (
                      <MenuItem key={city.cityID} value={city.cityID}>
                        {city.cityName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 1, mt: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Hotel Information:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption">Created:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(editingHotel.createdDT)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption">Last Modified:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {editingHotel.modifyDT ? formatDate(editingHotel.modifyDT) : 'Never'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: theme.palette.text.secondary }} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveEditedHotel}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={
              isLoading ||
              !editingHotel?.hotelName.trim() ||
              !editingHotel?.cityID ||
              !editingHotel?.hotalType ||
              !currentUser ||
              editHotelNameStatus.exists ||
              editHotelNameStatus.checking
            }
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HotelManagement;
