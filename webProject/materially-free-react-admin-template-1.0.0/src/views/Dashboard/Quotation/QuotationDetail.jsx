import React from 'react';
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
  Chip,
  Divider,
  Stack,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Hotel as HotelIcon,
  DirectionsCar as TransportIcon,
  Flight as AirlineIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

// Import API hooks for individual table data
import {
  useGetQuotationAccommodationsQuery,
  useGetQuotationTransportationsQuery,
  useGetQuotationVisasQuery,
  useGetQuotationAirlinesQuery
} from '../../../store/api/quotationApi';

const QuotationDetail = ({ quotation, onBack, onEdit }) => {
  const theme = useTheme();

  // Individual table data hooks
  const { data: accommodationsData = [] } = useGetQuotationAccommodationsQuery(quotation?.id, {
    skip: !quotation?.id
  });
  const { data: transportationsData = [] } = useGetQuotationTransportationsQuery(quotation?.id, {
    skip: !quotation?.id
  });
  const { data: visasData = [] } = useGetQuotationVisasQuery(quotation?.id, {
    skip: !quotation?.id
  });
  const { data: airlinesData = [] } = useGetQuotationAirlinesQuery(quotation?.id, {
    skip: !quotation?.id
  });

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

  // Calculate accommodation total for a specific accommodation item
  const calculateAccommodationTotal = (accommodation) => {
    const nights = accommodation.no_of_nights || 1;
    const rooms = accommodation.no_of_rooms || 1;
    const rate = accommodation.rate_per_night || 0;
    return rooms * nights * rate;
  };

  // Calculate transportation total for a specific transportation item
  const calculateTransportationTotal = (transportation) => {
    return (transportation.rate || 0) * (transportation.quantity || 0);
  };

  // Calculate visa total for a specific visa item
  const calculateVisaTotal = (visa) => {
    return (visa.Rate || 0) * (visa.Qty || 0);
  };

  // Calculate airline total for a specific airline item
  const calculateAirlineTotal = (airline) => {
    return (airline.rate || 0) * (airline.quantity || 0);
  };

  // Calculate totals
  const accommodationTotal = accommodationsData.reduce((sum, acc) => sum + calculateAccommodationTotal(acc), 0);
  const transportationTotal = transportationsData.reduce((sum, trans) => sum + calculateTransportationTotal(trans), 0);
  const visaTotal = visasData.reduce((sum, visa) => sum + calculateVisaTotal(visa), 0);
  const airlinesTotal = airlinesData.reduce((sum, airline) => sum + calculateAirlineTotal(airline), 0);

  if (!quotation) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No quotation data available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<BackIcon />} onClick={onBack} variant="outlined">
          Back to List
        </Button>
        <Button startIcon={<EditIcon />} onClick={() => onEdit(quotation)} variant="contained" color="primary">
          Edit Quotation
        </Button>
      </Box>

      {/* Header */}
      <Card sx={{ mb: 3, background: theme.palette.primary.main, color: 'white' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {quotation.quotation_number}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`Client ID: ${quotation.client_id}`} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                {quotation.traveling_details && (
                  <Chip
                    label={`Details: ${quotation.traveling_details}`}
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'white' }}
                  />
                )}
                {quotation.reference_by && (
                  <Chip label={`Ref: ${quotation.reference_by}`} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                )}
                <Chip label={quotation.status} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { md: 'right' } }}>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(quotation.grand_total)}
                </Typography>
                <Typography variant="body2">
                  {quotation.total_pax} passengers × {formatCurrency(quotation.cost_per_person)} per person
                </Typography>
                <Typography variant="caption" display="block">
                  Created: {formatDate(quotation.created_at)}
                </Typography>
                {quotation.updated_at && (
                  <Typography variant="caption" display="block">
                    Updated: {formatDate(quotation.updated_at)}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Trip Summary */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Trip Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Stay
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {quotation.total_stay_days} nights
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Passengers
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {quotation.total_pax}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Makkah
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {quotation.makkah_nights} nights
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Madinah
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {quotation.madinah_nights} nights
                  </Typography>
                </Grid>
                {quotation.makkah_nights1 > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Makkah (2nd)
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {quotation.makkah_nights1} nights
                    </Typography>
                  </Grid>
                )}
                {quotation.jeddah_nights > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Jeddah
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {quotation.jeddah_nights} nights
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Passenger Breakdown */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="secondary" />
                Passenger Breakdown
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Adults
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {quotation.adult_count}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Children
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="secondary">
                    {quotation.child_count}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Infants
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="info">
                    {quotation.infant_count}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Accommodations */}
        {accommodationsData.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HotelIcon color="primary" />
                  Accommodations ({accommodationsData.length})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>City</TableCell>
                        <TableCell>Hotel</TableCell>
                        <TableCell>Check In/Out</TableCell>
                        <TableCell>Room Type</TableCell>
                        <TableCell>Rooms</TableCell>
                        <TableCell>Nights</TableCell>
                        <TableCell>Rate/Night</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accommodationsData.map((acc, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {acc.city?.cityName || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{acc.hotel?.hotelName || 'N/A'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" display="block">
                              In: {formatDate(acc.check_in)}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Out: {formatDate(acc.check_out)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={acc.room_type?.toUpperCase()} size="small" color="primary" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" textAlign="center">
                              {acc.no_of_rooms}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" textAlign="center">
                              {acc.no_of_nights}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" textAlign="center">
                              {formatCurrency(acc.rate_per_night)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(calculateAccommodationTotal(acc))}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="h6">Total Accommodation: {formatCurrency(accommodationTotal)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Transportations */}
        {transportationsData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TransportIcon color="secondary" />
                  Transportation ({transportationsData.length})
                </Typography>
                {transportationsData.map((trans, index) => (
                  <Box key={index} sx={{ mb: 2, p: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {trans.vehicle_name}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {trans.capacity}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Sector: {trans.sector?.sectorName || 'N/A'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">
                        {trans.quantity} × {formatCurrency(trans.rate)}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(calculateTransportationTotal(trans))}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1" fontWeight="bold" textAlign="right">
                  Total: {formatCurrency(transportationTotal)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Visas */}
        {visasData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon color="info" />
                  Visa Services ({visasData.length})
                </Typography>
                {visasData.map((visa, index) => (
                  <Box key={index} sx={{ mb: 1, p: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {visa.Description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption">
                        {visa.Qty} × {formatCurrency(visa.Rate)}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(calculateVisaTotal(visa))}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1" fontWeight="bold" textAlign="right">
                  Total: {formatCurrency(visaTotal)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Airlines */}
        {airlinesData.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AirlineIcon color="warning" />
                  Airline Services ({airlinesData.length})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Carrier</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Sector</TableCell>
                        <TableCell>Pax Count</TableCell>
                        <TableCell>Rate</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {airlinesData.map((airline, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {airline.carrier}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={airline.class} size="small" color="warning" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{airline.sector}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" textAlign="center">
                              {airline.pax_count}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" textAlign="center">
                              {formatCurrency(airline.rate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" textAlign="center">
                              {airline.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(calculateAirlineTotal(airline))}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="h6">Total Airlines: {formatCurrency(airlinesTotal)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Financial Summary */}
        <Grid item xs={12}>
          <Card sx={{ background: theme.palette.success.light, color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Financial Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Accommodation</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(accommodationTotal)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Transportation</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(transportationTotal)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Visa Services</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(visaTotal)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Airlines</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(airlinesTotal)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1, borderColor: 'white' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total Package Cost</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatCurrency(quotation.total_package_cost)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body1">Advance</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(quotation.advance_amount)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1, borderColor: 'white' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h5">Grand Total</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(quotation.grand_total)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuotationDetail;
