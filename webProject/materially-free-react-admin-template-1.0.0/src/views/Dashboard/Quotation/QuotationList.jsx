import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  TextField,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Hotel as HotelIcon
} from '@mui/icons-material';

import { useDeleteQuotationMutation } from '../../../store/api/quotationApi';

const QuotationList = ({
  quotations,
  loading,
  error,
  onViewQuotation,
  onEditQuotation,
  onRefetch,
  totalQuotations,
  totalRevenue,
  averagePerPerson
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState(null);

  const [deleteQuotation] = useDeleteQuotationMutation();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PK');
  };

  // Filter quotations for list view
  const filteredQuotations = quotations.filter(
    (quotation) =>
      quotation.quotation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.traveling_details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.reference_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quotation.Client?.FullName && quotation.Client.FullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quotation.Client?.ContactNumber && quotation.Client.ContactNumber.includes(searchTerm))
  );

  console.log('Filtered Quotations:', filteredQuotations);
  // Delete handlers
  const handleDeleteClick = (quotation) => {
    setQuotationToDelete(quotation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (quotationToDelete) {
      try {
        await deleteQuotation(quotationToDelete.id).unwrap();
        setDeleteDialogOpen(false);
        setQuotationToDelete(null);
        onRefetch();
      } catch (error) {
        console.error('Failed to delete quotation:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setQuotationToDelete(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading quotations: {error.data?.message || 'Please try again later'}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header and Stats */}
      <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Quotation Records
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {totalQuotations} quotations
            </Typography>
          </Box>

          {/* Statistics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.primary.light, color: 'white' }}>
                <ReceiptIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {totalQuotations}
                </Typography>
                <Typography variant="body2">Total Quotations</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.success.light, color: 'white' }}>
                <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(totalRevenue)}
                </Typography>
                <Typography variant="body2">Total Revenue</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.info.light, color: 'white' }}>
                <HotelIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(averagePerPerson)}
                </Typography>
                <Typography variant="body2">Avg. Per Person</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search quotations by number, traveling details, reference, or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
        <CardContent>
          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableRow>
                  {['Quotation Info', 'Client Name', 'Trip Details', 'Passengers', 'Financial Summary', 'Status', 'Created', 'Actions'].map(
                    (header, index) => (
                      <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {header}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuotations.map((quotation) => (
                  <TableRow
                    key={quotation.id}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                      '&:hover': { backgroundColor: theme.palette.action.selected }
                    }}
                  >
                    {/* Quotation Info */}
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          {quotation.quotation_number}
                        </Typography>
                        {quotation.traveling_details && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {quotation.traveling_details}
                          </Typography>
                        )}
                        {quotation.reference_by && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Ref: {quotation.reference_by}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Client Details */}
                    <TableCell>
                      {quotation.client ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {quotation.client.fullName || 'N/A'}
                          </Typography>
                          {quotation.client.contactNumber && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              📞 {quotation.client.contactNumber}
                            </Typography>
                          )}
                          {quotation.client.whatsappNumber && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              💬 {quotation.client.whatsappNumber}
                            </Typography>
                          )}
                          {quotation.client.cityOfResidence && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              📍 {quotation.client.cityOfResidence}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {quotation.client_id}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Trip Details */}
                    <TableCell>
                      <Box>
                        <Typography variant="caption" display="block">
                          Stay: {quotation.total_stay_days} nights
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                          {quotation.makkah_nights > 0 && <Typography variant="caption">Makkah: {quotation.makkah_nights}n</Typography>}
                          {quotation.madinah_nights > 0 && <Typography variant="caption">Madinah: {quotation.madinah_nights}n</Typography>}
                          {quotation.makkah_nights1 > 0 && <Typography variant="caption">Makkah2: {quotation.makkah_nights1}n</Typography>}
                          {quotation.jeddah_nights > 0 && <Typography variant="caption">Jeddah: {quotation.jeddah_nights}n</Typography>}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Passengers */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption">Adults: {quotation.adult_count || 0}</Typography>
                        <Typography variant="caption">Children: {quotation.child_count || 0}</Typography>
                        <Typography variant="caption">Infants: {quotation.infant_count || 0}</Typography>
                        <Chip label={`Total: ${quotation.total_pax || 0}`} color="secondary" size="small" variant="outlined" />
                      </Box>
                    </TableCell>

                    {/* Financial Summary */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" fontWeight="bold">
                          Total: {formatCurrency(quotation.grand_total)}
                        </Typography>
                        <Typography variant="caption">Per Person: {formatCurrency(quotation.cost_per_person)}</Typography>
                        <Typography variant="caption">Advance: {formatCurrency(quotation.advance_amount)}</Typography>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={quotation.status}
                        size="small"
                        color={
                          quotation.status === 'Confirmed'
                            ? 'success'
                            : quotation.status === 'Pending'
                              ? 'warning'
                              : quotation.status === 'Cancelled'
                                ? 'error'
                                : 'default'
                        }
                      />
                    </TableCell>

                    {/* Created Date */}
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {formatDate(quotation.created_at)}
                      </Typography>
                      {quotation.updated_at && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Modified: {formatDate(quotation.updated_at)}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary" onClick={() => onViewQuotation(quotation)} sx={{ borderRadius: 1 }}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Quotation">
                          <IconButton size="small" color="secondary" onClick={() => onEditQuotation(quotation)} sx={{ borderRadius: 1 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Quotation">
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(quotation)} sx={{ borderRadius: 1 }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredQuotations.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                {searchTerm ? 'No quotations found matching your search.' : 'No quotations found.'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the quotation <strong>{quotationToDelete?.quotation_number}</strong>? This action cannot be
            undone.
          </Typography>
          {quotationToDelete?.Client && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Client: {quotationToDelete.Client.FullName}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuotationList;
