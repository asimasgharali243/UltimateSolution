import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, Tooltip, IconButton, Alert, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save as SaveIcon, Print as PrintIcon, Email as EmailIcon, Add as AddIcon } from '@mui/icons-material';

// Import API hooks
import { useGetQuotationsQuery } from '../../../store/api/quotationApi';

// Import components
import QuotationList from './QuotationList';
import QuotationForm from './QuotationForm';
import QuotationDetail from './QuotationDetail';

const Quotation = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  // State declarations
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewMode, setViewMode] = useState('create');
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // API Hooks
  const {
    data: quotations = [],
    isLoading: quotationsLoading,
    error: quotationsError,
    refetch: refetchQuotations
  } = useGetQuotationsQuery();

  // View mode handlers
  const handleViewQuotationList = () => {
    setViewMode('list');
    setSelectedQuotation(null);
    refetchQuotations();
  };

  const handleViewQuotation = (quotation) => {
    setSelectedQuotation(quotation);
    setViewMode('view');
  };

  const handleEditQuotation = (quotation) => {
    setSelectedQuotation(quotation);
    setViewMode('edit');
  };

  const handleCreateNew = () => {
    setViewMode('create');
    setSelectedQuotation(null);
  };

  const handleMessage = (type, text) => {
    setMessage({ type, text });
  };

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  // Calculate statistics
  const totalQuotations = quotations.length;
  const totalRevenue = quotations.reduce((sum, q) => sum + (q.grand_total || 0), 0);
  const averagePerPerson = totalQuotations > 0 ? quotations.reduce((sum, q) => sum + (q.cost_per_person || 0), 0) / totalQuotations : 0;

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
            ? 'CREATE QUOTATION'
            : viewMode === 'edit'
              ? 'EDIT QUOTATION'
              : viewMode === 'view'
                ? 'VIEW QUOTATION'
                : 'QUOTATION RECORDS'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {viewMode !== 'create' && (
            <Button variant="outlined" onClick={handleCreateNew} startIcon={<AddIcon />}>
              Create New
            </Button>
          )}
          {viewMode !== 'list' && (
            <Button variant="outlined" onClick={handleViewQuotationList}>
              View All
            </Button>
          )}
          <Tooltip title="Print Quotation">
            <IconButton color="secondary" sx={{ border: `1px solid ${theme.palette.secondary.main}` }}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Email Quotation">
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
        <QuotationList
          quotations={quotations}
          loading={quotationsLoading}
          error={quotationsError}
          onViewQuotation={handleViewQuotation}
          onEditQuotation={handleEditQuotation}
          onRefetch={refetchQuotations}
          totalQuotations={totalQuotations}
          totalRevenue={totalRevenue}
          averagePerPerson={averagePerPerson}
        />
      )}

      {viewMode === 'view' && (
        <QuotationDetail quotation={selectedQuotation} onBack={handleViewQuotationList} onEdit={handleEditQuotation} />
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <QuotationForm
          mode={viewMode}
          quotation={selectedQuotation}
          onSave={handleMessage}
          onCancel={handleViewQuotationList}
          onRefetch={refetchQuotations}
        />
      )}
    </Box>
  );
};

export default Quotation;
