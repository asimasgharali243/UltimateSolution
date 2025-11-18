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
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
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
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  Email as EmailIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const AccountList = ({
  accounts = [], // FIXED: Default to empty array
  loading,
  error,
  onViewAccount,
  onEditAccount,
  onDeleteAccount,
  onRefetch,
  totalAccounts,
  onCreateAccount
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

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

  // FIXED: Safe filtering
  const filteredAccounts = (Array.isArray(accounts) ? accounts : []).filter(
    (account) =>
      account?.accountTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account?.contactPersonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account?.contactPersonMobile?.includes(searchTerm) ||
      typeFilter === 'all' ||
      account?.accountType?.toLowerCase() === typeFilter.toLowerCase()
  );

  // FIXED: Safe statistics
  const clientCount = (Array.isArray(accounts) ? accounts : []).filter((a) => a?.accountType?.toLowerCase().includes('client')).length;

  const vendorCount = (Array.isArray(accounts) ? accounts : []).filter((a) => a?.accountType?.toLowerCase().includes('vendor')).length;

  // Delete handlers
  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (accountToDelete) {
      await onDeleteAccount(accountToDelete.accountID);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAccountToDelete(null);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header with Stats */}
      <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Account Records
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {totalAccounts || 0} accounts
            </Typography>
          </Box>

          {/* Statistics - FIXED: Use safe counts */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.primary.light, color: 'white' }}>
                <BusinessIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {totalAccounts || 0}
                </Typography>
                <Typography variant="body2">Total Accounts</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.success.light, color: 'white' }}>
                <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {clientCount}
                </Typography>
                <Typography variant="body2">Clients</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.info.light, color: 'white' }}>
                <ReceiptIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {vendorCount}
                </Typography>
                <Typography variant="body2">Vendors</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Search and Filters */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="supplier">Supplier</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="partner">Partner</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search accounts by title, contact, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 300, flex: 1 }}
            />

            {/* <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefetch} disabled={loading}>
              Refresh
            </Button> */}
            {/* <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateAccount}>
              Create Account
            </Button> */}
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading accounts: {error.data?.message || 'Please try again later'}
        </Alert>
      )}

      {/* Accounts Table - FIXED: Use filteredAccounts safely */}
      <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
        <CardContent>
          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableRow>
                  {['Account Info', 'Contact Details', 'Location', 'Financial Info', 'Status', 'Created', 'Actions'].map(
                    (header, index) => (
                      <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {header}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow
                    key={account?.accountID}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                      '&:hover': { backgroundColor: theme.palette.action.selected }
                    }}
                  >
                    {/* Account Info */}
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          {account?.accountTitle || 'N/A'}
                        </Typography>
                        <Chip
                          label={account?.accountType || 'Unknown'}
                          color={getAccountTypeColor(account?.accountType)}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </TableCell>

                    {/* Contact Details */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {account?.contactPersonName || 'N/A'}
                        </Typography>
                        {account?.contactPersonMobile && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            📞 {account.contactPersonMobile}
                          </Typography>
                        )}
                        {account?.contactPersonWhatsapp && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            💬 {account.contactPersonWhatsapp}
                          </Typography>
                        )}
                        {account?.contactPersonEmail && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            ✉️ {account.contactPersonEmail}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{account?.city || 'N/A'}</Typography>
                        {account?.address && (
                          <Typography variant="caption" color="text.secondary" display="block" noWrap>
                            {account.address.length > 30 ? `${account.address.substring(0, 30)}...` : account.address}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Financial Info */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption">Credit Limit: {formatCurrency(account?.creditLimit || 0)}</Typography>
                        <Typography variant="caption">Balance: {formatCurrency(account?.openingBalance || 0)}</Typography>
                        {(account?.creditDays || 0) > 0 && <Typography variant="caption">Credit Days: {account?.creditDays}</Typography>}
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip label="Active" size="small" color="success" />
                    </TableCell>

                    {/* Created Date */}
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {formatDate(account?.createdDT)}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary" onClick={() => onViewAccount(account)} sx={{ borderRadius: 1 }}>
                            <PersonIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Account">
                          <IconButton size="small" color="secondary" onClick={() => onEditAccount(account)} sx={{ borderRadius: 1 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Account">
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(account)} sx={{ borderRadius: 1 }}>
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

          {filteredAccounts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BusinessIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
              <Typography color="text.secondary">
                {searchTerm ? 'No accounts found matching your search.' : 'No accounts found.'}
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
            Are you sure you want to delete the account <strong>{accountToDelete?.accountTitle}</strong>? This action cannot be undone.
          </Typography>
          {accountToDelete?.contactPersonName && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Contact: {accountToDelete.contactPersonName}
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

export default AccountList;
