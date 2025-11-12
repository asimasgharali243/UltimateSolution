// src/views/Dashboard/Hotels/HotelManagement.jsx
import React, { useState } from 'react';
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TableFooter,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const HotelManagement = () => {
  const theme = useTheme();

  // Sample hotel data based on your image
  const [hotels, setHotels] = useState([
    {
      id: 1,
      city: 'MAKKAH',
      hotelName: 'FAKHIR AL AZIZIA',
      location: 'AZIZIA MAKKAH',
      distance: 'SHUTTLE SERVICE',
      sharing: 22,
      quint: 22,
      quad: 25,
      triple: 33,
      double: 49,
      checkInDate: '2025-08-25'
    },
    {
      id: 2,
      city: 'MAKKAH',
      hotelName: 'QILA AAYAD',
      location: 'AJYAD STREET',
      distance: 'SHUTTLE SERVICE',
      sharing: 28,
      quint: 28,
      quad: 32,
      triple: 42,
      double: 63,
      checkInDate: '2025-08-27'
    },
    {
      id: 3,
      city: 'MAKKAH',
      hotelName: 'AL KISWAN TOWERS',
      location: 'AL TAYSIR STREET',
      distance: 'SHUTTLE SERVICE',
      sharing: 32,
      quint: 31,
      quad: 36,
      triple: 48,
      double: 70,
      checkInDate: '2025-08-14'
    },
    {
      id: 4,
      city: 'MADINAH',
      hotelName: 'FUNDAQ AL RAYYAN',
      location: 'BEHIND MASJID QUBA ROAD',
      distance: 'SHUTTLE SERVICE',
      sharing: 36,
      quint: 36,
      quad: 41,
      triple: 54,
      double: 80,
      checkInDate: '2025-09-06'
    },
    {
      id: 5,
      city: 'MADINAH',
      hotelName: 'HALA TAIBAH',
      location: 'ABDUL AZIZ ROAD',
      distance: 'SHUTTLE SERVICE',
      sharing: 38,
      quint: 38,
      quad: 43,
      triple: 57,
      double: 85,
      checkInDate: '2025-09-06'
    }
  ]);

  const [newHotel, setNewHotel] = useState({
    city: 'MAKKAH',
    hotelName: '',
    location: '',
    distance: '',
    sharing: 0,
    quint: 0,
    quad: 0,
    triple: 0,
    double: 0,
    checkInDate: ''
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  // Options for dropdowns
  const cities = ['MAKKAH', 'MADINAH', 'JEDDAH'];

  const makkahHotels = [
    'FAKHIR AL AZIZIA',
    'QILA AAYAD',
    'AL KISWAN TOWERS',
    'VOCO HOTEL',
    'THAT HOTEL',
    'LAND PREMIUM',
    'MIAAO AL MAGD',
    'MELLA 1',
    'MELLA 2',
    'DIWAN AL BAIT',
    'SAIF AL MAGD',
    'AREEZ AL ZAHBI',
    'SHAMS AL ZAHBI',
    'DHAIF HOTEL',
    'BADAR AL MASSA',
    'NAWARA SHAMS 3'
  ];

  const madinahHotels = [
    'FUNDAQ AL RAYYAN',
    'HALA TAIBAH',
    'MANAZIL MARGAN',
    'DIYAR AL SAFA',
    'WAHAI AL SHARK',
    'NUZUL AL FALAH',
    'HAMOUDA AL MASH',
    'BURG NUKHTARA',
    'BIR AL EIMAN / WARDA SAFA',
    'TAIF NEBRAS',
    'MARGAN GOLDEN',
    'RAMA AL MADINAH'
  ];

  const jeddahHotels = ['JEDDAH HOTEL 1', 'JEDDAH HOTEL 2', 'JEDDAH HOTEL 3'];

  const getHotelsByCity = (city) => {
    switch (city) {
      case 'MAKKAH':
        return makkahHotels;
      case 'MADINAH':
        return madinahHotels;
      case 'JEDDAH':
        return jeddahHotels;
      default:
        return [];
    }
  };

  // Handle input changes for new hotel
  const handleNewHotelChange = (field, value) => {
    setNewHotel((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle input changes for editing hotel
  const handleEditHotelChange = (field, value) => {
    setEditingHotel((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new hotel
  const addHotel = () => {
    if (newHotel.hotelName && newHotel.location) {
      const hotelToAdd = {
        ...newHotel,
        id: Date.now()
      };
      setHotels((prev) => [...prev, hotelToAdd]);
      setNewHotel({
        city: 'MAKKAH',
        hotelName: '',
        location: '',
        distance: '',
        sharing: 0,
        quint: 0,
        quad: 0,
        triple: 0,
        double: 0,
        checkInDate: ''
      });
    }
  };

  // Edit hotel
  const openEditDialog = (hotel) => {
    setEditingHotel({ ...hotel });
    setEditDialogOpen(true);
  };

  const saveEditedHotel = () => {
    if (editingHotel) {
      setHotels((prev) => prev.map((hotel) => (hotel.id === editingHotel.id ? editingHotel : hotel)));
      setEditDialogOpen(false);
      setEditingHotel(null);
    }
  };

  // Delete hotel
  const deleteHotel = (id) => {
    setHotels((prev) => prev.filter((hotel) => hotel.id !== id));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK').format(amount);
  };

  // Table cell styles
  const tableCellStyles = {
    whiteSpace: 'nowrap',
    overflow: 'visible',
    textOverflow: 'clip',
    padding: '8px 12px'
  };

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
            color: 'transparent'
          }}
        >
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
        {/* Add New Hotel Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              Add New Hotel
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* City */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>City</InputLabel>
                  <Select value={newHotel.city} label="City" onChange={(e) => handleNewHotelChange('city', e.target.value)}>
                    {cities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Hotel Name */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Hotel Name</InputLabel>
                  <Select value={newHotel.hotelName} label="Hotel Name" onChange={(e) => handleNewHotelChange('hotelName', e.target.value)}>
                    {getHotelsByCity(newHotel.city).map((hotel) => (
                      <MenuItem key={hotel} value={hotel}>
                        {hotel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Location */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Location"
                  value={newHotel.location}
                  onChange={(e) => handleNewHotelChange('location', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              {/* Distance */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Distance"
                  value={newHotel.distance}
                  onChange={(e) => handleNewHotelChange('distance', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              {/* Check-in Date */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Check-in Date"
                  type="date"
                  value={newHotel.checkInDate}
                  onChange={(e) => handleNewHotelChange('checkInDate', e.target.value)}
                  size="small"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {/* Room Rates */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, color: theme.palette.text.secondary }}>
              Room Rates (SAR)
            </Typography>

            <Grid container spacing={2}>
              {[
                { label: 'Sharing', field: 'sharing' },
                { label: 'Quint', field: 'quint' },
                { label: 'Quad', field: 'quad' },
                { label: 'Triple', field: 'triple' },
                { label: 'Double', field: 'double' }
              ].map((item, index) => (
                <Grid item xs={12} sm={4} md={2.4} key={index}>
                  <TextField
                    fullWidth
                    label={item.label}
                    type="number"
                    value={newHotel[item.field]}
                    onChange={(e) => handleNewHotelChange(item.field, parseInt(e.target.value) || 0)}
                    size="small"
                    variant="outlined"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Add Button */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addHotel}
                sx={{
                  borderRadius: 2,
                  px: 3
                }}
              >
                Add Hotel
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Hotels List Card */}
        <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                Hotel List
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Hotels: {hotels.length}
              </Typography>
            </Box>

            <TableContainer
              sx={{
                maxWidth: '100%',
                overflowX: 'auto',
                borderRadius: 1,
                '& .MuiTableCell-root': {
                  padding: '8px 12px'
                }
              }}
            >
              <Table size="small" sx={{ minWidth: 1400 }}>
                <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableRow>
                    {[
                      { header: 'City', width: '120px' },
                      { header: 'Hotel Name', width: '200px' },
                      { header: 'Location', width: '200px' },
                      { header: 'Distance', width: '150px' },
                      { header: 'Check-in', width: '120px' },
                      { header: 'Sharing', width: '100px' },
                      { header: 'Quint', width: '100px' },
                      { header: 'Quad', width: '100px' },
                      { header: 'Triple', width: '100px' },
                      { header: 'Double', width: '100px' },
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
                      key={hotel.id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                        '&:hover': { backgroundColor: theme.palette.action.selected }
                      }}
                    >
                      <TableCell sx={tableCellStyles}>
                        <Chip
                          label={hotel.city}
                          color={hotel.city === 'MAKKAH' ? 'primary' : hotel.city === 'MADINAH' ? 'secondary' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Typography variant="body2" fontWeight="medium">
                          {hotel.hotelName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Typography variant="body2">{hotel.location}</Typography>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Typography variant="body2">{hotel.distance}</Typography>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Typography variant="body2">{hotel.checkInDate}</Typography>
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Chip
                          label={formatCurrency(hotel.sharing)}
                          color="info"
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 'bold', minWidth: '80px' }}
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Chip
                          label={formatCurrency(hotel.quint)}
                          color="info"
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 'bold', minWidth: '80px' }}
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Chip
                          label={formatCurrency(hotel.quad)}
                          color="info"
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 'bold', minWidth: '80px' }}
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Chip
                          label={formatCurrency(hotel.triple)}
                          color="info"
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 'bold', minWidth: '80px' }}
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Chip
                          label={formatCurrency(hotel.double)}
                          color="info"
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 'bold', minWidth: '80px' }}
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyles}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => openEditDialog(hotel)} sx={{ borderRadius: 1 }}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => deleteHotel(hotel.id)} sx={{ borderRadius: 1 }}>
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
                      Total Hotels: {hotels.length} | Makkah: {hotels.filter((h) => h.city === 'MAKKAH').length} | Madinah:{' '}
                      {hotels.filter((h) => h.city === 'MADINAH').length} | Jeddah: {hotels.filter((h) => h.city === 'JEDDAH').length}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Paper>

      {/* Edit Hotel Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>Edit Hotel</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {editingHotel && (
            <Grid container spacing={2}>
              {/* City */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                  <InputLabel>City</InputLabel>
                  <Select value={editingHotel.city} label="City" onChange={(e) => handleEditHotelChange('city', e.target.value)}>
                    {cities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Hotel Name */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                  <InputLabel>Hotel Name</InputLabel>
                  <Select
                    value={editingHotel.hotelName}
                    label="Hotel Name"
                    onChange={(e) => handleEditHotelChange('hotelName', e.target.value)}
                  >
                    {getHotelsByCity(editingHotel.city).map((hotel) => (
                      <MenuItem key={hotel} value={hotel}>
                        {hotel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Location */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={editingHotel.location}
                  onChange={(e) => handleEditHotelChange('location', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ mt: 2 }}
                />
              </Grid>

              {/* Distance */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Distance"
                  value={editingHotel.distance}
                  onChange={(e) => handleEditHotelChange('distance', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ mt: 2 }}
                />
              </Grid>

              {/* Check-in Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Check-in Date"
                  type="date"
                  value={editingHotel.checkInDate}
                  onChange={(e) => handleEditHotelChange('checkInDate', e.target.value)}
                  size="small"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ mt: 2 }}
                />
              </Grid>

              {/* Room Rates */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, color: theme.palette.text.secondary }}>
                  Room Rates (SAR)
                </Typography>
              </Grid>

              {[
                { label: 'Sharing', field: 'sharing' },
                { label: 'Quint', field: 'quint' },
                { label: 'Quad', field: 'quad' },
                { label: 'Triple', field: 'triple' },
                { label: 'Double', field: 'double' }
              ].map((item, index) => (
                <Grid item xs={12} sm={4} md={2.4} key={index}>
                  <TextField
                    fullWidth
                    label={item.label}
                    type="number"
                    value={editingHotel[item.field]}
                    onChange={(e) => handleEditHotelChange(item.field, parseInt(e.target.value) || 0)}
                    size="small"
                    variant="outlined"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: theme.palette.text.secondary }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveEditedHotel} startIcon={<SaveIcon />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HotelManagement;
