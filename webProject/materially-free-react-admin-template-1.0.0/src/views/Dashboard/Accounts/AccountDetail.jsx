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
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

const AccountDetail = ({ account, onBack, onEdit }) => {
  const theme = useTheme();

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

  const getAccountTypeColor = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('client')) return 'primary';
    if (typeLower.includes('vendor')) return 'secondary';
    if (typeLower.includes('supplier')) return 'success';
    if (typeLower.includes('customer')) return 'warning';
    if (typeLower.includes('partner')) return 'info';
    return 'default';
  };

  if (!account) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No account data available.</Typography>
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
        <Button startIcon={<EditIcon />} onClick={() => onEdit(account)} variant="contained" color="primary">
          Edit Account
        </Button>
      </Box>

      {/* Header */}
      <Card sx={{ mb: 3, background: theme.palette.primary.main, color: 'white' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {account.accountTitle}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={account.accountType} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                <Chip label={`ID: ${account.accountID}`} variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
                <Chip label="Active" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { md: 'right' } }}>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(account.openingBalance || 0)}
                </Typography>
                <Typography variant="body2">Current Balance</Typography>
                <Typography variant="caption" display="block">
                  Created: {formatDate(account.createdDT)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Contact Person
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {account.contactPersonName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Mobile
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="primary" />
                    {account.contactPersonMobile}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    WhatsApp
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="success" />
                    {account.contactPersonWhatsapp || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    {account.contactPersonEmail || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Location Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="secondary" />
                Location Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    City
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {account.city || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">{account.address || 'No address provided'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon color="success" />
                Financial Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Credit Limit
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {formatCurrency(account.creditLimit || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Opening Balance
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(account.openingBalance || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Credit Days
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {account.creditDays || 0} days
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Balance Date
                  </Typography>
                  <Typography variant="body1">{formatDate(account.openingBalanceDate)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tax Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="warning" />
                Tax Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    CNIC
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {account.cnic || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    NTN
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {account.ntn || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    STN
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {account.stn || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Card */}
        <Grid item xs={12}>
          <Card sx={{ background: theme.palette.success.light, color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Account Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Account Type</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {account.accountType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Status</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    Active
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Credit Available</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency((account.creditLimit || 0) - (account.openingBalance || 0))}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Created On</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatDate(account.createdDT)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountDetail;
