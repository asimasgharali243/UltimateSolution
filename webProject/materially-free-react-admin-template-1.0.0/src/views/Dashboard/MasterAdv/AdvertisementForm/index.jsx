// src/views/Dashboard/Advertisement/AdvertisementForm.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Snackbar,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TableFooter,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import {
  useCreateMasterMutation,
  useUpdateMasterMutation,
  useGetMasterByIdQuery,
  useLazyCheckVNoExistsQuery,
  useGetClientsQuery
} from '../../../../store/api/advertisementApi';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AdvertisementPrintView from './AdvertisementPrintView';

const AdvertisementForm = ({ mode, master, onSave, onCancel, onRefetch }) => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  // PDF ref and state
  const printRef = useRef();
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // State for master form data
  const [formData, setFormData] = useState({
    vNo: 0,
    billNo: '',
    billDate: new Date().toISOString().split('T')[0],
    roNo: '',
    roDate: new Date().toISOString().split('T')[0],
    Notes: '',
    clientID: '',
    agencyName: '',
    pID: '',
    caption: '',
    frontPageExtra: 0,
    backPageExtra: 0,
    comission: 0,
    createdBy: user?.id || 1
  });

  // State for detail records
  const [detailRecords, setDetailRecords] = useState([]);
  const [editingDetailIndex, setEditingDetailIndex] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  const [vNoChecking, setVNoChecking] = useState(false);

  // Detail form state
  const [detailForm, setDetailForm] = useState({
    inserationDate: new Date().toISOString().split('T')[0],
    color: '100%',
    size: '',
    totalSpace: '',
    position: '',
    rate: 0
  });

  // API hooks
  const [createMaster, { isLoading: creating }] = useCreateMasterMutation();
  const [updateMaster, { isLoading: updating }] = useUpdateMasterMutation();
  const [checkVNoExists] = useLazyCheckVNoExistsQuery();

  // Fetch clients for dropdown
  const { data: clientsResponse, isLoading: loadingClients } = useGetClientsQuery();
  const clients = clientsResponse?.data || [];

  // Fetch master data if in edit mode
  const { data: masterResponse, isLoading: loadingMaster } = useGetMasterByIdQuery(master?.masterID, {
    skip: !master?.masterID || mode === 'create'
  });
  const masterData = masterResponse?.data;

  // Position options for dropdown
  const positionOptions = ['F.P.', 'B.P.', 'Inside', 'Special Position', 'Other'];

  // PDF Generation Function
  const generatePDF = async () => {
    try {
      setGeneratingPDF(true);

      // Validate data
      if (!formData.clientID || detailRecords.length === 0) {
        showMessage('Please fill client information and add advertisement details first!', 'error');
        setGeneratingPDF(false);
        return;
      }

      // Ensure ref is available
      if (!printRef.current) {
        showMessage('PDF content not ready.', 'error');
        setGeneratingPDF(false);
        return;
      }

      const element = printRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      // Calculate width/height to fit A4 page
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      showMessage('PDF opened in browser preview!', 'info');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      showMessage('Failed to generate PDF.', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Update form data when master data is loaded
  useEffect(() => {
    if (masterData && mode === 'edit') {
      const updatedFormData = {
        vNo: masterData.vNo || 0,
        billNo: masterData.billNo || '',
        billDate: masterData.billDate ? new Date(masterData.billDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        roNo: masterData.roNo || '',
        roDate: masterData.roDate ? new Date(masterData.roDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        Notes: masterData.Notes || '',
        clientID: masterData.clientID || '',
        agencyName: masterData.agencyName || '',
        pID: masterData.pID || '',
        caption: masterData.caption || '',
        frontPageExtra: masterData.frontPageExtra || 0,
        backPageExtra: masterData.backPageExtra || 0,
        comission: masterData.comission || 0,
        createdBy: user?.id || 1
      };

      setFormData(updatedFormData);

      // Load detail records if available
      if (masterData.details) {
        setDetailRecords(
          masterData.details.map((detail) => ({
            ...detail,
            inserationDate: detail.inserationDate
              ? new Date(detail.inserationDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0]
          }))
        );
      }
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        vNo: 0,
        billNo: '',
        billDate: new Date().toISOString().split('T')[0],
        roNo: '',
        roDate: new Date().toISOString().split('T')[0],
        Notes: '',
        clientID: '',
        agencyName: '',
        pID: '',
        caption: '',
        frontPageExtra: 0,
        backPageExtra: 0,
        comission: 0,
        createdBy: user?.id || 1
      });
      setSelectedClient(null);
      setDetailRecords([]);
      resetDetailForm();
    }
  }, [masterData, mode, master, user]);

  // Update selected client when clients data loads or form data changes
  useEffect(() => {
    if (clients.length > 0 && formData.clientID) {
      const client = clients.find((c) => c.id === formData.clientID);
      if (client) {
        setSelectedClient(client);
      }
    } else if (!formData.clientID) {
      setSelectedClient(null);
    }
  }, [clients, formData.clientID]);

  // Reset detail form
  const resetDetailForm = () => {
    setDetailForm({
      inserationDate: new Date().toISOString().split('T')[0],
      color: '100%',
      size: '',
      totalSpace: '',
      position: '',
      rate: 0
    });
    setEditingDetailIndex(null);
  };

  const showMessage = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.vNo || formData.vNo <= 0) {
      newErrors.vNo = 'Voucher number is required and must be greater than 0';
    }

    if (!formData.clientID) {
      newErrors.clientID = 'Client selection is required';
    }

    if (detailRecords.length === 0) {
      newErrors.details = 'At least one advertisement detail is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.vNo, formData.clientID, detailRecords.length]);

  // Validate detail form
  const validateDetailForm = useCallback(() => {
    if (!detailForm.inserationDate) {
      showMessage('Insertion date is required', 'error');
      return false;
    }
    if (!detailForm.position) {
      showMessage('Position is required', 'error');
      return false;
    }
    if (!detailForm.rate || detailForm.rate <= 0) {
      showMessage('Rate is required and must be greater than 0', 'error');
      return false;
    }
    return true;
  }, [detailForm, showMessage]);

  // Detail record handlers
  const handleAddDetail = () => {
    if (!validateDetailForm()) {
      return;
    }

    const newDetail = {
      id: editingDetailIndex !== null ? detailRecords[editingDetailIndex].id : 0,
      inserationDate: detailForm.inserationDate,
      color: detailForm.color,
      size: detailForm.size,
      totalSpace: detailForm.totalSpace,
      position: detailForm.position,
      rate: parseInt(detailForm.rate) || 0
    };

    if (editingDetailIndex !== null) {
      // Update existing record
      const updatedRecords = [...detailRecords];
      updatedRecords[editingDetailIndex] = newDetail;
      setDetailRecords(updatedRecords);
      showMessage('Advertisement detail updated successfully!', 'success');
    } else {
      // Add new record
      setDetailRecords([...detailRecords, newDetail]);
      showMessage('Advertisement detail added successfully!', 'success');
    }

    resetDetailForm();
  };

  const handleEditDetail = (index) => {
    const record = detailRecords[index];
    setDetailForm({
      inserationDate: record.inserationDate,
      color: record.color,
      size: record.size,
      totalSpace: record.totalSpace,
      position: record.position,
      rate: record.rate
    });
    setEditingDetailIndex(index);
  };

  const handleDeleteDetail = (index) => {
    const updatedRecords = detailRecords.filter((_, i) => i !== index);
    setDetailRecords(updatedRecords);
    if (editingDetailIndex === index) {
      resetDetailForm();
    }
    showMessage('Advertisement detail deleted successfully!', 'success');
  };

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const advertisementAmount = detailRecords.reduce((sum, record) => {
      const spaceValue = parseInt(record.totalSpace) || 0;
      return sum + record.rate * spaceValue;
    }, 0);

    const frontPageExtraAmount = (advertisementAmount * (formData.frontPageExtra || 0)) / 100;
    const backPageExtraAmount = (advertisementAmount * (formData.backPageExtra || 0)) / 100;
    const extrasAmount = frontPageExtraAmount + backPageExtraAmount;

    const grossTotal = advertisementAmount + extrasAmount;
    const netAmount = grossTotal - (formData.comission || 0);

    return {
      totalAmount: advertisementAmount,
      extrasAmount: Math.round(extrasAmount),
      grossTotal: Math.round(grossTotal),
      netAmount: Math.round(netAmount)
    };
  }, [detailRecords, formData.frontPageExtra, formData.backPageExtra, formData.comission]);

  const totals = calculateTotals();

  const handleClientChange = (event, newValue) => {
    setSelectedClient(newValue);
    setFormData((prev) => ({
      ...prev,
      clientID: newValue ? newValue.id : '',
      agencyName: newValue ? newValue.fullName : prev.agencyName
    }));

    // Clear error when user selects a client
    if (errors.clientID) {
      setErrors((prev) => ({
        ...prev,
        clientID: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? 0 : parseInt(value) || 0
    }));
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetailForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVNoChange = async (e) => {
    const value = parseInt(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      vNo: value
    }));

    // Clear previous error
    if (errors.vNo) {
      setErrors((prev) => ({
        ...prev,
        vNo: ''
      }));
    }

    // Check if VNo already exists
    if (value > 0) {
      setVNoChecking(true);
      try {
        const { data: existsResponse } = await checkVNoExists({
          vNo: value,
          excludeId: mode === 'edit' ? master?.masterID : null
        });

        if (existsResponse?.data) {
          setErrors((prev) => ({
            ...prev,
            vNo: 'Voucher number already exists'
          }));
        }
      } catch (error) {
        console.error('Error checking VNo:', error);
      } finally {
        setVNoChecking(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showMessage('Please fix the form errors', 'error');
      return;
    }

    try {
      const submitData = {
        master: {
          ...formData,
          clientID: parseInt(formData.clientID),
          frontPageExtra: parseInt(formData.frontPageExtra),
          backPageExtra: parseInt(formData.backPageExtra),
          comission: parseInt(formData.comission),
          createdBy: user?.id || 1,
          createdDT: new Date().toISOString(),
          modifyBy: user?.id || 1,
          modifyDT: new Date().toISOString()
        },
        details: detailRecords.map((detail) => ({
          ...detail,
          rate: parseInt(detail.rate),
          masterID: mode === 'edit' ? master.masterID : 0 // Will be set by backend
        }))
      };

      let result;
      if (mode === 'edit') {
        result = await updateMaster({ id: master.masterID, ...submitData }).unwrap();
      } else {
        result = await createMaster(submitData).unwrap();
      }

      if (result.success) {
        showMessage(`Advertisement bill ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
        if (onRefetch) onRefetch();
        setTimeout(() => onSave && onSave(), 1000);
      }
    } catch (error) {
      console.error('Failed to save advertisement bill:', error);
      const errorMessage = error?.data?.message || error?.error || 'Failed to save advertisement bill. Please try again.';
      showMessage(errorMessage, 'error');
    }
  };

  const handleReset = () => {
    setFormData({
      vNo: 0,
      billNo: '',
      billDate: new Date().toISOString().split('T')[0],
      roNo: '',
      roDate: new Date().toISOString().split('T')[0],
      Notes: '',
      clientID: '',
      agencyName: '',
      pID: '',
      caption: '',
      frontPageExtra: 0,
      backPageExtra: 0,
      comission: 0,
      createdBy: user?.id || 1
    });
    setSelectedClient(null);
    setDetailRecords([]);
    resetDetailForm();
    setErrors({});
    showMessage('Form has been reset', 'info');
  };

  const isLoading = creating || updating || loadingMaster;
  const isVNoFieldLoading = vNoChecking;
  const isClientsLoading = loadingClients;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper
        elevation={8}
        sx={{ p: { xs: 2, sm: 3 }, background: '#ffffff', border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1
            }}
          >
            {mode === 'edit' ? 'Edit Advertisement Bill' : 'Create Advertisement Bill'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mode === 'edit' ? 'Update existing advertisement bill details' : 'Add new advertisement bill to the system'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <Card sx={{ mb: 3, background: '#ffffff', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.primary.main,
                  mb: 3,
                  fontWeight: 600,
                  borderBottom: `2px solid ${theme.palette.primary.light}`,
                  pb: 1
                }}
              >
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Voucher No *"
                    name="vNo"
                    type="number"
                    value={formData.vNo}
                    onChange={handleVNoChange}
                    error={!!errors.vNo}
                    helperText={errors.vNo}
                    required
                    variant="outlined"
                    size="small"
                    disabled={isVNoFieldLoading}
                    InputProps={{
                      endAdornment: isVNoFieldLoading ? <CircularProgress size={20} /> : null
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Bill No"
                    name="billNo"
                    value={formData.billNo}
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Bill Date"
                    name="billDate"
                    type="date"
                    value={formData.billDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="RO No"
                    name="roNo"
                    value={formData.roNo}
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="RO Date"
                    name="roDate"
                    type="date"
                    value={formData.roDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    fullWidth
                    options={clients}
                    getOptionLabel={(option) => option.fullName || ''}
                    value={selectedClient}
                    onChange={handleClientChange}
                    loading={isClientsLoading}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Client *"
                        variant="outlined"
                        size="small"
                        placeholder="Select a client"
                        error={!!errors.clientID}
                        helperText={errors.clientID}
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isClientsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          )
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option.id}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {option.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Contact: {option.contactNumber} | City: {option.cityOfResidence}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="PID"
                    name="pID"
                    value={formData.pID}
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    label="Agency Name"
                    name="agencyName"
                    value={formData.agencyName}
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    label="Caption"
                    name="caption"
                    value={formData.caption}
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="Notes"
                    value={formData.Notes}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    variant="outlined"
                    size="small"
                    placeholder="Enter any additional notes or comments..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* Advertisement Details Section */}
          <Card sx={{ mb: 3, background: '#ffffff', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                  Advertisement Details
                </Typography>
                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddDetail} sx={{ mr: 2 }}>
                    {editingDetailIndex !== null ? 'Update Detail' : 'Add Detail'}
                  </Button>
                  {editingDetailIndex !== null && (
                    <Button variant="outlined" onClick={resetDetailForm}>
                      Cancel Edit
                    </Button>
                  )}
                </Grid>
              </Box>

              {/* Detail Form */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Insertion Date *"
                    name="inserationDate"
                    type="date"
                    value={detailForm.inserationDate}
                    onChange={handleDetailChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Color"
                    name="color"
                    value={detailForm.color}
                    onChange={handleDetailChange}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., 100%"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Size"
                    name="size"
                    value={detailForm.size}
                    onChange={handleDetailChange}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., 10K2"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Total Space"
                    name="totalSpace"
                    value={detailForm.totalSpace}
                    onChange={handleDetailChange}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., 20cm"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Position *</InputLabel>
                    <Select name="position" value={detailForm.position} label="Position *" onChange={handleDetailChange}>
                      {positionOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Rate *"
                    name="rate"
                    type="number"
                    value={detailForm.rate}
                    onChange={handleDetailChange}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Details Table */}
              {errors.details && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.details}
                </Alert>
              )}

              <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', borderRadius: 1 }}>
                <Table size="small" sx={{ minWidth: 800 }}>
                  <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableRow>
                      {['Insertion Date', 'Color', 'Size', 'Total Space', 'Position', 'Rate', 'Amount', 'Actions'].map((header, index) => (
                        <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailRecords.map((record, index) => {
                      const spaceValue = parseInt(record.totalSpace) || 0;
                      const amount = record.rate * spaceValue;
                      return (
                        <TableRow
                          key={index}
                          sx={{
                            '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                            '&:hover': { backgroundColor: theme.palette.action.selected }
                          }}
                        >
                          <TableCell>{record.inserationDate}</TableCell>
                          <TableCell>{record.color}</TableCell>
                          <TableCell>{record.size}</TableCell>
                          <TableCell>{record.totalSpace}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.position}
                              size="small"
                              color={record.position === 'F.P.' ? 'primary' : record.position === 'B.P.' ? 'secondary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {record.rate.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {amount.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditDetail(index)} color="primary">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDeleteDetail(index)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {detailRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">No advertisement details added yet</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell colSpan={6} align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        Total Amount:
                      </TableCell>
                      <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.palette.primary.main }}>
                        {totals.totalAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* Extras & Commission Section */}
          <Card sx={{ mb: 3, background: '#ffffff', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.primary.main,
                  mb: 3,
                  fontWeight: 600,
                  borderBottom: `2px solid ${theme.palette.primary.light}`,
                  pb: 1
                }}
              >
                Extras & Commission
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Front Page Extra %"
                    name="frontPageExtra"
                    type="number"
                    value={formData.frontPageExtra}
                    onChange={handleNumberChange}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      endAdornment: <Typography variant="body2">%</Typography>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Back Page Extra %"
                    name="backPageExtra"
                    type="number"
                    value={formData.backPageExtra}
                    onChange={handleNumberChange}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      endAdornment: <Typography variant="body2">%</Typography>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Commission Amount"
                    name="comission"
                    type="number"
                    value={formData.comission}
                    onChange={handleNumberChange}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* Summary Section */}
          <Card sx={{ mb: 3, background: theme.palette.primary.main, color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" textAlign="center">
                Financial Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Advertisement Amount
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {totals.totalAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Extras Amount
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {totals.extrasAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Commission
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formData.comission.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Net Amount
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {totals.netAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Footer Notes */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              background: theme.palette.warning.light,
              borderRadius: 2,
              border: `1px solid ${theme.palette.warning.main}`
            }}
          >
            <Typography variant="body2" textAlign="center" sx={{ color: theme.palette.warning.dark }}>
              <strong>REMARKS:</strong> Please quote bill when remitting payment. All payments should be made through Crossed Cheques / Pay
              Order in the name of Daily Gujranwala Times.
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              mt: 4,
              p: 3,
              background: '#ffffff',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={onCancel}
                disabled={isLoading}
                size="large"
                sx={{ minWidth: 120 }}
              >
                Cancel
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Open PDF in browser preview - Use browser's Save as PDF option to download">
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={generatingPDF ? <CircularProgress size={20} /> : <PdfIcon />}
                  onClick={generatePDF}
                  disabled={generatingPDF || !formData.clientID || detailRecords.length === 0}
                  size="large"
                >
                  {generatingPDF ? 'Generating PDF...' : 'Preview PDF'}
                </Button>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                type="submit"
                disabled={isLoading || !!errors.vNo || isVNoFieldLoading}
                size="large"
                sx={{ minWidth: 140 }}
              >
                {isLoading ? 'Saving...' : mode === 'edit' ? 'Update Bill' : 'Save Bill'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      {/* PDF Print View */}
      <div
        data-printable="advertisement"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto',
          zIndex: -1,
          background: 'white',
          opacity: 0
        }}
      >
        <AdvertisementPrintView
          ref={printRef}
          formData={formData}
          detailRecords={detailRecords}
          selectedClient={selectedClient}
          totals={totals}
        />
      </div>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdvertisementForm;
