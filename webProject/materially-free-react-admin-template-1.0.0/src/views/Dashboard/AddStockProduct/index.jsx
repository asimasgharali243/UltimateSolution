import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, Tooltip, IconButton, Alert, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save as SaveIcon, Print as PrintIcon, Email as EmailIcon, Add as AddIcon } from '@mui/icons-material';

// Import API hooks
import { useGetItemsQuery } from '../../../store/api/itemApi';

// Import components
import StockProductList from './StockProductList';
import StockProductForm from './StockProductForm';
import StockProductDetail from './StockProductDetail';

const StockProduct = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  // State declarations
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewMode, setViewMode] = useState('create');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // API Hooks
  const { data: products = [], isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useGetItemsQuery();
  productsLoading ? null : console.log('product', products);
  // View mode handlers
  const handleViewProductList = () => {
    setViewMode('list');
    setSelectedProduct(null);
    refetchProducts();
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setViewMode('view');
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setViewMode('edit');
  };

  const handleCreateNew = () => {
    setViewMode('create');
    setSelectedProduct(null);
  };

  const handleMessage = (type, text) => {
    setMessage({ type, text });
  };

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  // Calculate statistics
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.openingQuantity || 0) * (p.openingRate || 0), 0);
  const averagePrice = totalProducts > 0 ? products.reduce((sum, p) => sum + (p.sRate || 0), 0) / totalProducts : 0;

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
          {viewMode === 'create'
            ? 'ADD STOCK PRODUCT'
            : viewMode === 'edit'
              ? 'EDIT STOCK PRODUCT'
              : viewMode === 'view'
                ? 'VIEW STOCK PRODUCT'
                : 'STOCK PRODUCT RECORDS'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {viewMode !== 'create' && (
            <Button variant="outlined" onClick={handleCreateNew} startIcon={<AddIcon />}>
              Add New
            </Button>
          )}
          {viewMode !== 'list' && (
            <Button variant="outlined" onClick={handleViewProductList}>
              View All
            </Button>
          )}
          <Tooltip title="Print Product Details">
            <IconButton color="secondary" sx={{ border: `1px solid ${theme.palette.secondary.main}` }}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Products">
            <IconButton color="success" sx={{ border: `1px solid ${theme.palette.success.main}` }}>
              <EmailIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Message Alert */}
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={clearMessage}>
          {message.text}
        </Alert>
      )}

      {/* Main Content Based on View Mode */}
      {viewMode === 'list' && (
        <StockProductList
          products={products}
          loading={productsLoading}
          error={productsError}
          onViewProduct={handleViewProduct}
          onEditProduct={handleEditProduct}
          onRefetch={refetchProducts}
          totalProducts={totalProducts}
          totalStockValue={totalStockValue}
          averagePrice={averagePrice}
        />
      )}

      {viewMode === 'view' && <StockProductDetail product={selectedProduct} onBack={handleViewProductList} onEdit={handleEditProduct} />}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <StockProductForm
          mode={viewMode}
          product={selectedProduct}
          onSave={handleMessage}
          onCancel={handleViewProductList}
          onRefetch={refetchProducts}
        />
      )}
    </Box>
  );
};

export default StockProduct;
