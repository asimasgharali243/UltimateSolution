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
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

import { useDeleteItemMutation } from '../../../store/api/itemApi';

const StockProductList = ({
  products,
  loading,
  error,
  onViewProduct,
  onEditProduct,
  onRefetch,
  totalProducts,
  totalStockValue,
  averageCost
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [deleteProduct] = useDeleteItemMutation();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Filter products for list view
  const filteredProducts = products.filter(
    (product) =>
      product.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.groupName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete handlers
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.itemID).unwrap();
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        onRefetch();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
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
        Error loading products: {error.data?.message || 'Please try again later'}
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
              Stock Product Records
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {totalProducts} products
            </Typography>
          </Box>

          {/* Statistics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.primary.light, color: 'white' }}>
                <InventoryIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {totalProducts}
                </Typography>
                <Typography variant="body2">Total Products</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.success.light, color: 'white' }}>
                <MoneyIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(totalStockValue)}
                </Typography>
                <Typography variant="body2">Total Stock Value</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: theme.palette.info.light, color: 'white' }}>
                <CategoryIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(averageCost)}
                </Typography>
                <Typography variant="body2">Avg. Cost</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search products by name, code, category, or group..."
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

      {/* Products Table */}
      <Card sx={{ background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
        <CardContent>
          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableRow>
                  {['Product Info', 'Category & Group', 'Stock Details', 'Pricing', 'Accounts', 'Status', 'Actions'].map(
                    (header, index) => (
                      <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {header}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.itemID}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                      '&:hover': { backgroundColor: theme.palette.action.selected }
                    }}
                  >
                    {/* Product Info */}
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          {product.itemName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Code: {product.itemCode}
                        </Typography>
                        {product.notes && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {product.notes.length > 50 ? `${product.notes.substring(0, 50)}...` : product.notes}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Category & Group */}
                    <TableCell>
                      <Box>
                        {product.categoryName && (
                          <Typography variant="body2" fontWeight="medium">
                            {product.categoryName}
                          </Typography>
                        )}
                        {product.groupName && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Group: {product.groupName}
                          </Typography>
                        )}
                        {product.unitName && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Unit: {product.unitName}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Stock Details */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption">Current: {product.openingQuantity || 0}</Typography>
                        <Typography variant="caption">Min Level: {product.minLevel || 'N/A'}</Typography>
                        <Typography variant="caption">
                          Value: {formatCurrency((product.openingQuantity || 0) * (product.openingRate || 0))}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Pricing */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" fontWeight="bold">
                          Sale: {formatCurrency(product.sRate)}
                        </Typography>
                        <Typography variant="caption">Cost: {formatCurrency(product.pRate)}</Typography>
                        <Typography variant="caption">Opening Rate: {formatCurrency(product.openingRate)}</Typography>
                      </Box>
                    </TableCell>

                    {/* Accounts */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {product.stockAssetAccountName && <Typography variant="caption">Stock: {product.stockAssetAccountName}</Typography>}
                        {product.incomeAccountName && <Typography variant="caption">Income: {product.incomeAccountName}</Typography>}
                        {product.expenseAccountName && <Typography variant="caption">Expense: {product.expenseAccountName}</Typography>}
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={product.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={product.isActive ? 'success' : 'default'}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary" onClick={() => onViewProduct(product)} sx={{ borderRadius: 1 }}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Product">
                          <IconButton size="small" color="secondary" onClick={() => onEditProduct(product)} sx={{ borderRadius: 1 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Product">
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(product)} sx={{ borderRadius: 1 }}>
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

          {filteredProducts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                {searchTerm ? 'No products found matching your search.' : 'No products found.'}
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
            Are you sure you want to delete the product <strong>{productToDelete?.itemName}</strong>? This action cannot be undone.
          </Typography>
          {productToDelete && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Code: {productToDelete.itemCode}
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

export default StockProductList;
