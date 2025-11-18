// src/views/Dashboard/Advertisement/AdvertisementList.jsx
import React, { useState, useMemo } from 'react';
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
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useGetMastersQuery, useDeleteMasterMutation } from '../../../../store/api/advertisementApi';

const AdvertisementList = ({ onEdit, onView, onCreateNew, onRefetch }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: mastersResponse,
    isLoading,
    error,
    refetch
  } = useGetMastersQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  const [deleteMaster] = useDeleteMasterMutation();

  const masters = mastersResponse?.data || [];

  const filteredMasters = useMemo(() => {
    return masters.filter((master) => {
      const matchesSearch =
        master.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        master.agencyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        master.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        master.accountTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || // Fixed: changed from AccountTitle to accountTitle
        master.accountContactPerson?.toLowerCase().includes(searchTerm.toLowerCase()); // Fixed: changed from AccountContactPerson to accountContactPerson

      return matchesSearch;
    });
  }, [masters, searchTerm]);

  const paginatedMasters = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredMasters.slice(start, start + rowsPerPage);
  }, [filteredMasters, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement bill?')) {
      try {
        const result = await deleteMaster(id).unwrap();
        if (result.success) {
          if (onRefetch) onRefetch();
        }
      } catch (error) {
        console.error('Failed to delete master:', error);
        alert(error?.data?.message || 'Failed to delete advertisement bill');
      }
    }
  };

  const calculateMasterTotal = (master) => {
    if (!master.details) return 0; // Fixed: changed from Details to details
    return master.details.reduce((sum, detail) => {
      const spaceValue = parseInt(detail.totalSpace) || 0;
      return sum + detail.rate * spaceValue;
    }, 0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading advertisement bills...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading advertisement bills: {error?.data?.message || 'Please try again later'}
        <Button onClick={refetch} sx={{ ml: 2 }} size="small">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: theme.palette.primary.main, color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                {masters.length}
              </Typography>
              <Typography variant="body2">Total Bills</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: theme.palette.success.main, color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                {masters.reduce((sum, master) => sum + calculateMasterTotal(master), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2">Total Amount</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: theme.palette.info.main, color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                {filteredMasters.length}
              </Typography>
              <Typography variant="body2">Filtered Results</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar Only - Removed duplicate buttons */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            placeholder="Search by Bill No, Agency, Caption, or Account..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
            variant="outlined"
            size="small"
          />
        </Grid>
      </Grid>

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredMasters.length} of {masters.length} advertisement bills
      </Typography>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Bill No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Account</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Agency</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Caption</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Bill Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Voucher No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Total Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMasters.map((master) => (
              <TableRow
                key={master.masterID}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight="medium">
                      {master.billNo || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{master.accountTitle || 'N/A'}</Typography>{' '}
                  {/* Fixed: changed from AccountTitle to accountTitle */}
                  {master.accountContactPerson && ( // Fixed: changed from AccountContactPerson to accountContactPerson
                    <Typography variant="caption" color="text.secondary" display="block">
                      {master.accountContactPerson}
                    </Typography>
                  )}
                  {master.accountContactMobile && ( // Fixed: changed from AccountContactMobile to accountContactMobile
                    <Typography variant="caption" color="text.secondary" display="block">
                      {master.accountContactMobile}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{master.agencyName || 'N/A'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                    {master.caption || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{master.billDate ? new Date(master.billDate).toLocaleDateString() : 'N/A'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={`V-${master.vNo}`} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {calculateMasterTotal(master).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => onView(master)} color="info">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(master)} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(master.masterID)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedMasters.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {masters.length === 0
                      ? 'No advertisement bills found. Create your first bill!'
                      : 'No results match your search criteria.'}
                  </Typography>
                  {masters.length === 0 && (
                    <Button variant="contained" onClick={onCreateNew} sx={{ mt: 2 }}>
                      Create First Bill
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredMasters.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          '& .MuiTablePagination-toolbar': {
            padding: 2
          }
        }}
      />
    </Box>
  );
};

export default AdvertisementList;
