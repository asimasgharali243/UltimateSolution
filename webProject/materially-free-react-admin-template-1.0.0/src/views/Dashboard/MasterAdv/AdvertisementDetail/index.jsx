// src/views/Dashboard/Advertisement/AdvertisementDetail.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Receipt as ReceiptIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const AdvertisementDetail = ({ advertisement, onBack, onEdit }) => {
  const theme = useTheme();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate totals
  const calculateTotals = (ad) => {
    if (!ad || !ad.details) return { totalAmount: 0, netAmount: 0 };

    const advertisementAmount = ad.details.reduce((sum, detail) => {
      const spaceValue = parseInt(detail.totalSpace) || 0;
      return sum + detail.rate * spaceValue;
    }, 0);

    const frontPageExtraAmount = (advertisementAmount * (ad.frontPageExtra || 0)) / 100;
    const backPageExtraAmount = (advertisementAmount * (ad.backPageExtra || 0)) / 100;
    const extrasAmount = frontPageExtraAmount + backPageExtraAmount;

    const grossTotal = advertisementAmount + extrasAmount;
    const netAmount = grossTotal - (ad.comission || 0);

    return {
      totalAmount: advertisementAmount,
      extrasAmount: Math.round(extrasAmount),
      grossTotal: Math.round(grossTotal),
      netAmount: Math.round(netAmount)
    };
  };

  const totals = calculateTotals(advertisement);

  if (!advertisement) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No advertisement data available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Button startIcon={<BackIcon />} onClick={onBack} variant="outlined">
          Back to List
        </Button>
        <Button startIcon={<EditIcon />} onClick={() => onEdit(advertisement)} variant="contained" color="primary">
          Edit Advertisement
        </Button>
      </Box>

      {/* Header */}
      <Card sx={{ mb: 3, background: theme.palette.primary.main, color: 'white' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Voucher #{advertisement.vNo}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {advertisement.billNo && (
                  <Chip label={`Bill: ${advertisement.billNo}`} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                )}
                {advertisement.clientID && (
                  <Chip label={`Client ID: ${advertisement.clientID}`} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                )}
                {advertisement.pID && (
                  <Chip label={`PID: ${advertisement.pID}`} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { md: 'right' } }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {formatCurrency(totals.netAmount)}
                </Typography>
                <Typography variant="body2">Net Amount</Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Created: {formatDate(advertisement.createdDT)}
                </Typography>
                {advertisement.modifyDT && (
                  <Typography variant="caption" display="block">
                    Updated: {formatDate(advertisement.modifyDT)}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Bill Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="primary" />
                Bill Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Bill Number
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {advertisement.billNo || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Bill Date
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDate(advertisement.billDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    RO Number
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {advertisement.roNo || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    RO Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(advertisement.roDate)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Client & Agency Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="info" />
                Client & Agency
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Client Name
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {advertisement.clientName || 'N/A'}
                  </Typography>
                  {advertisement.clientContactNumber && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Contact: {advertisement.clientContactNumber}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Agency Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {advertisement.agencyName || 'N/A'}
                  </Typography>
                </Grid>
                {advertisement.caption && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Caption
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {advertisement.caption}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Advertisement Details */}
        {advertisement.details && advertisement.details.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon color="secondary" />
                  Advertisement Details ({advertisement.details.length} items)
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Insertion Date</TableCell>
                        <TableCell>Color</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Total Space</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell align="right">Rate</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {advertisement.details.map((detail, index) => {
                        const spaceValue = parseInt(detail.totalSpace) || 0;
                        const amount = detail.rate * spaceValue;
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon fontSize="small" color="action" />
                                {formatDate(detail.inserationDate)}
                              </Box>
                            </TableCell>
                            <TableCell>{detail.color}</TableCell>
                            <TableCell>{detail.size}</TableCell>
                            <TableCell>{detail.totalSpace}</TableCell>
                            <TableCell>
                              <Chip label={detail.position} size="small" color={detail.position === 'F.P.' ? 'primary' : 'secondary'} />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(detail.rate)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" color="primary">
                                {formatCurrency(amount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Financial Summary */}
        <Grid item xs={12}>
          <Card sx={{ background: theme.palette.success.main, color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Financial Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Advertisement Amount
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(totals.totalAmount)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Extras Amount
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(totals.extrasAmount)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Commission
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(advertisement.comission)}
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
                      {formatCurrency(totals.netAmount)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Front Page Extra: {advertisement.frontPageExtra}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Back Page Extra: {advertisement.backPageExtra}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notes */}
        {advertisement.Notes && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Notes
                </Typography>
                <Typography variant="body1" sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                  {advertisement.Notes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AdvertisementDetail;
