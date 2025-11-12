// src/views/Dashboard/Advertisement/index.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, Tooltip, IconButton, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Print as PrintIcon, Email as EmailIcon, Add as AddIcon } from '@mui/icons-material';

import { useGetMastersQuery } from '../../../store/api/advertisementApi';

import AdvertisementList from './AdvertisementList';
import AdvertisementForm from './AdvertisementForm';
import AdvertisementDetail from './AdvertisementDetail';

const Advertisement = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  // State declarations
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [selectedAdvertisement, setSelectedAdvertisement] = useState(null);

  // API Hooks
  const {
    data: advertisementsResponse,
    isLoading: advertisementsLoading,
    error: advertisementsError,
    refetch: refetchAdvertisements
  } = useGetMastersQuery();

  const advertisements = advertisementsResponse?.data || [];

  // View mode handlers
  const handleViewAdvertisementList = () => {
    setViewMode('list');
    setSelectedAdvertisement(null);
    refetchAdvertisements();
  };

  const handleViewAdvertisement = (advertisement) => {
    setSelectedAdvertisement(advertisement);
    setViewMode('view');
  };

  const handleEditAdvertisement = (advertisement) => {
    setSelectedAdvertisement(advertisement);
    setViewMode('edit');
  };

  const handleCreateNew = () => {
    setViewMode('create');
    setSelectedAdvertisement(null);
  };

  const handleSaveSuccess = () => {
    setMessage({ type: 'success', text: `Advertisement bill ${viewMode === 'edit' ? 'updated' : 'created'} successfully!` });
    handleViewAdvertisementList();
  };

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  // Calculate statistics
  const totalAdvertisements = advertisements.length;
  const totalAmount = advertisements.reduce((sum, ad) => {
    const adTotal =
      ad.details?.reduce((detailSum, detail) => {
        const spaceValue = parseInt(detail.totalSpace) || 0;
        return detailSum + detail.rate * spaceValue;
      }, 0) || 0;
    return sum + adTotal;
  }, 0);

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
            ? 'CREATE ADVERTISEMENT BILL'
            : viewMode === 'edit'
              ? 'EDIT ADVERTISEMENT BILL'
              : viewMode === 'view'
                ? 'ADVERTISEMENT BILL DETAILS'
                : 'ADVERTISEMENT BILLS'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {viewMode !== 'create' && viewMode !== 'edit' && (
            <Button variant="outlined" onClick={handleCreateNew} startIcon={<AddIcon />}>
              Create New Bill
            </Button>
          )}
          {viewMode !== 'list' && (
            <Button variant="outlined" onClick={handleViewAdvertisementList}>
              View All Bills
            </Button>
          )}
          {viewMode === 'view' && (
            <Button variant="contained" onClick={() => handleEditAdvertisement(selectedAdvertisement)}>
              Edit Bill
            </Button>
          )}
          <Tooltip title="Print Bill">
            <IconButton color="secondary" sx={{ border: `1px solid ${theme.palette.secondary.main}` }}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Email Bill">
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
        <AdvertisementList
          onEdit={handleEditAdvertisement}
          onView={handleViewAdvertisement}
          onCreateNew={handleCreateNew}
          onRefetch={refetchAdvertisements}
        />
      )}

      {viewMode === 'view' && (
        <AdvertisementDetail advertisement={selectedAdvertisement} onBack={handleViewAdvertisementList} onEdit={handleEditAdvertisement} />
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <AdvertisementForm
          mode={viewMode}
          master={selectedAdvertisement}
          onSave={handleSaveSuccess}
          onCancel={handleViewAdvertisementList}
          onRefetch={refetchAdvertisements}
        />
      )}
    </Box>
  );
};

export default Advertisement;
