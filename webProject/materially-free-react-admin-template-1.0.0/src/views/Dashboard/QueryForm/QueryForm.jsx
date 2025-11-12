import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
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
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Flight as FlightIcon,
  Hotel as HotelIcon,
  Receipt as QuotationIcon
} from '@mui/icons-material';

// Import API hooks
import {
  useGetQueryFormsQuery,
  useCreateQueryFormMutation,
  useUpdateQueryFormMutation,
  useDeleteQueryFormMutation
} from '../../../store/api/queryFormApi';

// Import custom components
import DateRangeFilter from '../../Utils/DateRangeFilter';

const QueryFormPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  // API Hooks
  const { data: queryForms = [], isLoading, refetch } = useGetQueryFormsQuery();
  const [createQueryForm, { isLoading: creating }] = useCreateQueryFormMutation();
  const [updateQueryForm, { isLoading: updating }] = useUpdateQueryFormMutation();
  const [deleteQueryForm] = useDeleteQueryFormMutation();

  // State
  const [mode, setMode] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState(null);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [queryForQuotation, setQueryForQuotation] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    orderStatus: 'Client Name',
    searchText: '',
    dateRange: 'This Week',
    dateFrom: '',
    dateTo: ''
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const initialFormState = {
    fullName: '',
    mobile: '',
    whatsApp: '',
    email: '',
    groupHeadName: '',
    groupHeadMobile: '',
    groupHeadWhatsapp: '',
    groupHeadEmail: '',
    route: '',
    airline: '',
    adjults: '',
    child: '',
    cityResidance: '',
    cityDeparture: '',
    dateDeparture: '',
    dateArrival: '',
    hotelCategory: '',
    roomType: '',
    daysMakkah: '',
    daysMadina: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Options
  const hotelCategories = ['5 Star Deluxe', '5 Star', '4 Star', '3 Star', 'Economy'];
  const roomTypes = ['Single', 'Double', 'Triple', 'Quad', 'Sharing'];
  const orderStatusOptions = ['Client Name', 'Client Phone Number', 'Group Head Name', 'Group Head Phone Number'];

  // Initialize form when mode changes
  useEffect(() => {
    if (mode === 'create') {
      setFormData(initialFormState);
      setSelectedQuery(null);
    } else if (mode === 'edit' && selectedQuery) {
      setFormData({
        fullName: selectedQuery.fullName || '',
        mobile: selectedQuery.mobile || '',
        whatsApp: selectedQuery.whatsApp || '',
        email: selectedQuery.email || '',
        groupHeadName: selectedQuery.groupHeadName || '',
        groupHeadMobile: selectedQuery.groupHeadMobile || '',
        groupHeadWhatsapp: selectedQuery.groupHeadWhatsapp || '',
        groupHeadEmail: selectedQuery.groupHeadEmail || '',
        route: selectedQuery.route || '',
        airline: selectedQuery.airline || '',
        adjults: selectedQuery.adjults || '',
        child: selectedQuery.child || '',
        cityResidance: selectedQuery.cityResidance || '',
        cityDeparture: selectedQuery.cityDeparture || '',
        dateDeparture: selectedQuery.dateDeparture ? formatDateForInput(selectedQuery.dateDeparture) : '',
        dateArrival: selectedQuery.dateArrival ? formatDateForInput(selectedQuery.dateArrival) : '',
        hotelCategory: selectedQuery.hotelCategory || '',
        roomType: selectedQuery.roomType || '',
        daysMakkah: selectedQuery.daysMakkah || '',
        daysMadina: selectedQuery.daysMadina || ''
      });
    }
  }, [mode, selectedQuery]);

  // Helper functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (typeof dateString === 'string') {
      return dateString.split('T')[0];
    }
    return dateString;
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter functions
  const getFilteredQueryForms = () => {
    let filtered = [...queryForms];

    // Apply search filter based on selected order status
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter((query) => {
        switch (filters.orderStatus) {
          case 'Client Name':
            return query.fullName?.toLowerCase().includes(searchLower);
          case 'Client Phone Number':
            return query.mobile?.includes(searchLower) || query.whatsApp?.includes(searchLower);
          case 'Group Head Name':
            return query.groupHeadName?.toLowerCase().includes(searchLower);
          case 'Group Head Phone Number':
            return query.groupHeadMobile?.includes(searchLower) || query.groupHeadWhatsapp?.includes(searchLower);
          default:
            return true;
        }
      });
    }

    // Apply date range filter
    if (filters.dateFrom && filters.dateTo) {
      filtered = filtered.filter((query) => {
        const queryDate = new Date(query.createdDT || query.dateDeparture || query.dateArrival);
        const fromDate = new Date(filters.dateFrom);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);

        return queryDate >= fromDate && queryDate <= toDate;
      });
    }

    return filtered;
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      orderStatus: 'Client Name',
      searchText: '',
      dateRange: 'This Week',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleDateRangeClear = (defaultValues) => {
    setFilters((prev) => ({
      ...prev,
      ...defaultValues
    }));
  };

  const hasActiveFilters = () => {
    return filters.searchText || filters.dateFrom || filters.dateTo || filters.orderStatus !== 'Client Name';
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Form actions
  const handleCreate = () => {
    setMode('create');
    setSelectedQuery(null);
  };

  const handleEdit = (query) => {
    setSelectedQuery(query);
    setMode('edit');
  };

  const handleView = (query) => {
    setSelectedQuery(query);
    setMode('view');
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedQuery(null);
    setFormData(initialFormState);
  };

  const handleDelete = (query) => {
    setQueryToDelete(query);
    setDeleteDialogOpen(true);
  };

  // Handle Create Quotation
  const handleCreateQuotation = (query) => {
    setQueryForQuotation(query);
    setQuotationDialogOpen(true);
  };

  // Enhanced Prepare Quotation Data from Query
  const prepareQuotationData = (query) => {
    console.log('📝 Original query data:', query); // Debug log

    // Calculate nights from dates
    const calculateNights = (startDate, endDate) => {
      if (!startDate || !endDate) return 0;
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } catch (error) {
        console.error('Error calculating nights:', error);
        return 0;
      }
    };

    const nightsMakkah = query.daysMakkah || calculateNights(query.dateDeparture, query.dateArrival) || 0;
    const nightsMadina = query.daysMadina || 0;

    const totalAdults = parseInt(query.adjults || 0);
    const totalChildren = parseInt(query.child || 0);
    const totalPax = totalAdults + totalChildren;

    // Calculate visa rates based on quantity
    const calculateVisaRate = (quantity, isInfant = false) => {
      const qty = parseInt(quantity) || 0;
      if (isInfant) return '480';
      if (qty >= 5) return '699';
      if (qty === 4) return '800';
      if (qty === 3) return '825';
      if (qty === 2) return '850';
      if (qty === 1) return '900';
      return '';
    };

    const visaRate = calculateVisaRate(totalPax);

    // Format dates for input fields
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      if (typeof dateString === 'string') {
        return dateString.split('T')[0];
      }
      return dateString;
    };

    const quotationData = {
      // Client Information - MUST match QuotationForm structure exactly
      clientType: 'new',
      newClientData: {
        clientName: query.fullName || '',
        contactNumber: query.mobile || '',
        whatsappNumber: query.whatsApp || '',
        groupHeadName: query.groupHeadName || '',
        groupHeadNumber: query.groupHeadMobile || '',
        cityOfResidence: query.cityResidance || '',
        passportValidity: '',
        specialRequirements: ''
      },

      // Trip Details
      traveling_details: `Query from ${query.fullName} - ${query.route || 'Umrah Package'}`,
      packgeID: '',
      reference_by: '',

      // Nights
      makkah_nights: nightsMakkah.toString(),
      madinah_nights: nightsMadina.toString(),
      makkah_nights1: '',
      jeddah_nights: '',

      // Passenger Counts
      adult_count: totalAdults.toString(),
      child_count: totalChildren.toString(),
      infant_count: '0',

      // Advance Amount
      advance_amount: '',

      // Accommodation - format dates properly
      accommodations: [
        {
          cityID: '',
          hotelID: '',
          check_in: formatDateForInput(query.dateDeparture) || '',
          check_out: formatDateForInput(query.dateArrival) || '',
          room_type: query.roomType ? query.roomType.toLowerCase() : 'sharing',
          no_of_rooms: '',
          no_of_nights: (nightsMakkah + nightsMadina).toString(),
          rate_per_night: ''
        }
      ],

      // Transportation
      transportations: [
        {
          vehicle_name: '',
          capacity: '',
          sectorID: '',
          rate: '',
          quantity: ''
        }
      ],

      // Visas
      visas:
        totalPax > 0
          ? [
              {
                Description: 'ONLY UMRA VISA',
                Rate: visaRate,
                Qty: totalPax.toString()
              }
            ]
          : [
              {
                Description: '',
                Rate: '',
                Qty: ''
              }
            ],

      // Airlines
      airlines: query.airline
        ? [
            {
              carrier: query.airline || '',
              pax_count: totalPax.toString(),
              class: 'Economy',
              sector: query.route || '',
              rate: '',
              quantity: '1'
            }
          ]
        : [
            {
              carrier: '',
              pax_count: '',
              class: 'Economy',
              sector: '',
              rate: '',
              quantity: ''
            }
          ],

      // Source query information
      sourceQueryId: query.queryID,
      sourceQueryNumber: query.queryNumber || `QUERY-${query.queryID}`
    };

    console.log('✅ Prepared quotation data:', quotationData); // Debug log
    return quotationData;
  };

  // Confirm Create Quotation with Navigation - FIXED VERSION
  const confirmCreateQuotation = () => {
    if (queryForQuotation) {
      // Prepare quotation data from query form
      const quotationData = prepareQuotationData(queryForQuotation);

      console.log('🚀 Navigating to quotation with data:', quotationData);

      // Navigate to quotation page with state - FIXED: Use correct key
      navigate('/dashboard/quotation', {
        state: {
          queryData: quotationData // This MUST match what QuotationForm expects
        }
      });

      setQuotationDialogOpen(false);
      setQueryForQuotation(null);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteQueryForm(queryToDelete.queryID).unwrap();
      showSnackbar('Query form deleted successfully!', 'success');
      setDeleteDialogOpen(false);
      setQueryToDelete(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete query form:', error);
      showSnackbar('Failed to delete query form', 'error');
    }
  };

  // Handle submit function
  const handleSubmit = async () => {
    try {
      // Prepare data for submission
      const submitData = {
        fullName: formData.fullName || '',
        mobile: formData.mobile || '',
        whatsApp: formData.whatsApp || null,
        email: formData.email || null,
        groupHeadName: formData.groupHeadName || null,
        groupHeadMobile: formData.groupHeadMobile || null,
        groupHeadWhatsapp: formData.groupHeadWhatsapp || null,
        groupHeadEmail: formData.groupHeadEmail || null,
        route: formData.route || null,
        airline: formData.airline || null,
        adjults: formData.adjults ? parseInt(formData.adjults) : null,
        child: formData.child ? parseInt(formData.child) : null,
        cityResidance: formData.cityResidance || null,
        cityDeparture: formData.cityDeparture || null,
        dateDeparture: formData.dateDeparture || null,
        dateArrival: formData.dateArrival || null,
        hotelCategory: formData.hotelCategory || null,
        roomType: formData.roomType || null,
        daysMakkah: formData.daysMakkah ? parseInt(formData.daysMakkah) : null,
        daysMadina: formData.daysMadina ? parseInt(formData.daysMadina) : null,
        createdBy: user?.userID || 1
      };

      if (mode === 'create') {
        await createQueryForm(submitData).unwrap();
        showSnackbar('Query form created successfully!', 'success');
      } else if (mode === 'edit') {
        await updateQueryForm({
          id: selectedQuery.queryID,
          ...submitData
        }).unwrap();
        showSnackbar('Query form updated successfully!', 'success');
      }

      setMode('list');
      setSelectedQuery(null);
      setFormData(initialFormState);
      refetch();
    } catch (error) {
      console.error('Failed to save query form:', error);

      if (error.data && error.data.errors) {
        const errorMessages = Object.values(error.data.errors).flat().join(', ');
        showSnackbar(`Validation failed: ${errorMessages}`, 'error');
      } else {
        showSnackbar('Failed to save query form. Please check your data.', 'error');
      }
    }
  };

  // Render Filter Section
  const renderFilterSection = () => (
    <Card sx={{ mb: 3, p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          minHeight: 60
        }}
      >
        {/* Filter Icon and Title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
            minWidth: isMobile ? '100%' : 'auto'
          }}
        >
          <FilterIcon color="primary" />
          <Typography variant="h6" color="primary" sx={{ whiteSpace: 'nowrap' }}>
            Filters
          </Typography>
        </Box>

        {/* Search By Dropdown */}
        <FormControl
          size="small"
          sx={{
            minWidth: 160,
            flexShrink: 0,
            flex: isMobile ? '1 1 calc(50% - 8px)' : '0 1 auto'
          }}
        >
          <InputLabel>Search By</InputLabel>
          <Select value={filters.orderStatus} label="Search By" onChange={(e) => handleFilterChange('orderStatus', e.target.value)}>
            {orderStatusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Search Text Field */}
        <TextField
          size="small"
          label={`Search ${filters.orderStatus}`}
          value={filters.searchText}
          onChange={(e) => handleFilterChange('searchText', e.target.value)}
          sx={{
            minWidth: 200,
            flex: isMobile ? '1 1 calc(50% - 8px)' : '1 1 auto',
            maxWidth: isMobile ? '100%' : 300
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: filters.searchText && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => handleFilterChange('searchText', '')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* Date Range Filter */}
        <Box
          sx={{
            flex: isMobile ? '1 1 100%' : '2 1 auto',
            minWidth: isMobile ? '100%' : 400,
            maxWidth: isMobile ? '100%' : 'none'
          }}
        >
          <DateRangeFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleDateRangeClear}
            label="Date Range"
            showClearButton={true}
            size="small"
            compact={true}
            showQuickSelect={!isMobile}
          />
        </Box>

        {/* Clear All Button */}
        {hasActiveFilters() && (
          <Button
            variant="outlined"
            style={{ border: 'none' }}
            startIcon={<ClearIcon />}
            onClick={clearAllFilters}
            size="large"
            sx={{
              flexShrink: 0,
              ml: isMobile ? 'auto' : 0,
              mt: isMobile ? 1 : 0
            }}
          ></Button>
        )}
      </Box>

      {/* Active Filters Chip - Only show on mobile */}
      {isMobile && hasActiveFilters() && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={`${getFilteredQueryForms().length} results`} size="small" color="primary" />
        </Box>
      )}
    </Card>
  );

  // Render List View
  const renderListView = () => {
    const filteredQueryForms = getFilteredQueryForms();

    return (
      <Box>
        {/* Header with Title and Create Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexDirection: isSmallMobile ? 'column' : 'row',
            gap: isSmallMobile ? 2 : 0
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="primary">
            Query Forms
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} fullWidth={isSmallMobile}>
            New Query Form
          </Button>
        </Box>

        {/* Filter Section */}
        {renderFilterSection()}

        {/* Results Count */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexDirection: isSmallMobile ? 'column' : 'row',
            gap: isSmallMobile ? 1 : 0
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {filteredQueryForms.length} of {queryForms.length} entries
            {hasActiveFilters() && ' (filtered)'}
          </Typography>
          {!isMobile && hasActiveFilters() && (
            <Chip label={`${filteredQueryForms.length} results`} size="small" color="primary" variant="outlined" />
          )}
        </Box>

        {/* Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer sx={{ maxHeight: isMobile ? 400 : 600 }}>
              <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    {['ID', 'Full Name', 'Mobile', 'Email', 'Route', 'Adults', 'Children', 'Status', 'Actions'].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQueryForms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          {queryForms.length === 0 ? 'No query forms found' : 'No query forms match your filters'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQueryForms.map((query) => (
                      <TableRow key={query.queryID} hover>
                        <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{query.queryID}</TableCell>
                        <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {query.fullName}
                          </Typography>
                          {query.groupHeadName && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Group: {query.groupHeadName}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                          <Box>
                            <Typography variant="body2">{query.mobile}</Typography>
                            {query.whatsApp && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                WA: {query.whatsApp}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{query.email}</TableCell>
                        <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{query.route}</TableCell>
                        <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{query.adjults || 0}</TableCell>
                        <TableCell sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{query.child || 0}</TableCell>
                        <TableCell>
                          <Chip
                            label="Active"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: isMobile ? '0.6rem' : '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small" color="info" onClick={() => handleView(query)}>
                                <ViewIcon fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" color="primary" onClick={() => handleEdit(query)}>
                                <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Create Quotation">
                              <IconButton size="small" color="secondary" onClick={() => handleCreateQuotation(query)}>
                                <QuotationIcon fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => handleDelete(query)}>
                                <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Render Form View (Create/Edit) - Single View
  const renderFormView = () => {
    const isEdit = mode === 'edit';

    return (
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={handleCancel}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {isEdit ? 'Edit Query Form' : 'Create New Query Form'}
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* Client Information Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Client Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name *"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mobile *"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="WhatsApp"
                      value={formData.whatsApp}
                      onChange={(e) => handleInputChange('whatsApp', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City of Residence"
                      value={formData.cityResidance}
                      onChange={(e) => handleInputChange('cityResidance', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City of Departure"
                      value={formData.cityDeparture}
                      onChange={(e) => handleInputChange('cityDeparture', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Group Details Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
                  <GroupIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Group Details
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Group Head Name"
                      value={formData.groupHeadName}
                      onChange={(e) => handleInputChange('groupHeadName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Group Head Mobile"
                      value={formData.groupHeadMobile}
                      onChange={(e) => handleInputChange('groupHeadMobile', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Group Head WhatsApp"
                      value={formData.groupHeadWhatsapp}
                      onChange={(e) => handleInputChange('groupHeadWhatsapp', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Group Head Email"
                      type="email"
                      value={formData.groupHeadEmail}
                      onChange={(e) => handleInputChange('groupHeadEmail', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Number of Adults"
                      type="number"
                      value={formData.adjults}
                      onChange={(e) => handleInputChange('adjults', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Number of Children"
                      type="number"
                      value={formData.child}
                      onChange={(e) => handleInputChange('child', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Travel Information Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
                  <FlightIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Travel Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Route"
                      value={formData.route}
                      onChange={(e) => handleInputChange('route', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Airline"
                      value={formData.airline}
                      onChange={(e) => handleInputChange('airline', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Departure Date"
                      type="date"
                      value={formData.dateDeparture}
                      onChange={(e) => handleInputChange('dateDeparture', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Arrival Date"
                      type="date"
                      value={formData.dateArrival}
                      onChange={(e) => handleInputChange('dateArrival', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Days in Makkah"
                      type="number"
                      value={formData.daysMakkah}
                      onChange={(e) => handleInputChange('daysMakkah', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Days in Madina"
                      type="number"
                      value={formData.daysMadina}
                      onChange={(e) => handleInputChange('daysMadina', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Accommodation Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
                  <HotelIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Accommodation
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Hotel Category</InputLabel>
                      <Select
                        value={formData.hotelCategory}
                        label="Hotel Category"
                        onChange={(e) => handleInputChange('hotelCategory', e.target.value)}
                      >
                        {hotelCategories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Room Type</InputLabel>
                      <Select value={formData.roomType} label="Room Type" onChange={(e) => handleInputChange('roomType', e.target.value)}>
                        {roomTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button onClick={handleCancel} variant="outlined" color="secondary">
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSubmit} disabled={creating || updating} startIcon={<SaveIcon />}>
                {creating || updating ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Render View Mode
  const renderViewMode = () => {
    if (!selectedQuery) return null;

    return (
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleCancel}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Query Form Details
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => setMode('edit')}>
            Edit
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Client Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Client Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">{selectedQuery.fullName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Mobile
                    </Typography>
                    <Typography variant="body1">{selectedQuery.mobile || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      WhatsApp
                    </Typography>
                    <Typography variant="body1">{selectedQuery.whatsApp || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{selectedQuery.email || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Group Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <GroupIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Group Details
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Group Head Name
                    </Typography>
                    <Typography variant="body1">{selectedQuery.groupHeadName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Group Head Mobile
                    </Typography>
                    <Typography variant="body1">{selectedQuery.groupHeadMobile || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Adults
                    </Typography>
                    <Typography variant="body1">{selectedQuery.adjults || 0}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Children
                    </Typography>
                    <Typography variant="body1">{selectedQuery.child || 0}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Travel Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FlightIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Travel Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Route
                    </Typography>
                    <Typography variant="body1">{selectedQuery.route || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Airline
                    </Typography>
                    <Typography variant="body1">{selectedQuery.airline || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Departure Date
                    </Typography>
                    <Typography variant="body1">{formatDateForDisplay(selectedQuery.dateDeparture)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Arrival Date
                    </Typography>
                    <Typography variant="body1">{formatDateForDisplay(selectedQuery.dateArrival)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Days in Makkah
                    </Typography>
                    <Typography variant="body1">{selectedQuery.daysMakkah || 0}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Days in Madina
                    </Typography>
                    <Typography variant="body1">{selectedQuery.daysMadina || 0}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Accommodation */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HotelIcon color="primary" />
                  <Typography variant="h6" color="primary">
                    Accommodation
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Hotel Category
                    </Typography>
                    <Typography variant="body1">{selectedQuery.hotelCategory || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Room Type
                    </Typography>
                    <Typography variant="body1">{selectedQuery.roomType || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {mode === 'list' && renderListView()}
          {['create', 'edit'].includes(mode) && renderFormView()}
          {mode === 'view' && renderViewMode()}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete query form for <strong>{queryToDelete?.fullName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Quotation Confirmation Dialog */}
      <Dialog open={quotationDialogOpen} onClose={() => setQuotationDialogOpen(false)}>
        <DialogTitle>Create Quotation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to create a quotation for <strong>{queryForQuotation?.fullName}</strong>?
          </Typography>
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              The following information will be pre-filled in the quotation:
            </Typography>
            <ul>
              <li>Client: {queryForQuotation?.fullName}</li>
              <li>Contact: {queryForQuotation?.mobile}</li>
              <li>Adults: {queryForQuotation?.adjults || 0}</li>
              <li>Children: {queryForQuotation?.child || 0}</li>
              {queryForQuotation?.route && <li>Route: {queryForQuotation.route}</li>}
              {queryForQuotation?.dateDeparture && <li>Departure: {formatDateForDisplay(queryForQuotation.dateDeparture)}</li>}
            </ul>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuotationDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmCreateQuotation} color="primary" variant="contained">
            Create Quotation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QueryFormPage;
