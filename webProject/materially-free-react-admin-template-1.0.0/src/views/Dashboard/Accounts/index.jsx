import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, Tooltip, IconButton, Alert, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Add as AddIcon, Print as PrintIcon, Email as EmailIcon, Save as SaveIcon } from '@mui/icons-material';

// Import API hooks
import { useGetAccountsQuery } from '../../../store/api/accountApi';

// Import components
import AccountList from './AccountList';
import AccountForm from './AccountForm';
import AccountDetail from './AccountDetail';

const Account = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  // State declarations
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewMode, setViewMode] = useState('list');
  const [selectedAccount, setSelectedAccount] = useState(null);

  // API Hooks - FIXED: Handle API response structure
  const { data: accountsResponse = {}, isLoading: accountsLoading, error: accountsError, refetch: refetchAccounts } = useGetAccountsQuery();

  // FIXED: Extract accounts array safely from API response
  const accounts = accountsResponse.data || accountsResponse || [];
  console.log('Accounts data:', accounts); // Debug log

  // View mode handlers
  const handleViewAccountList = () => {
    setViewMode('list');
    setSelectedAccount(null);
    refetchAccounts();
  };

  const handleViewAccount = (account) => {
    setSelectedAccount(account);
    setViewMode('view');
  };

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setViewMode('edit');
  };

  const handleCreateNew = () => {
    setViewMode('create');
    setSelectedAccount(null);
  };

  const handleMessage = (type, text) => {
    setMessage({ type, text });
  };

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  // FIXED: Calculate statistics safely
  const totalAccounts = Array.isArray(accounts) ? accounts.length : 0;
  const totalBalance = Array.isArray(accounts) ? accounts.reduce((sum, account) => sum + (account.openingBalance || 0), 0) : 0;
  const totalCreditLimit = Array.isArray(accounts) ? accounts.reduce((sum, account) => sum + (account.creditLimit || 0), 0) : 0;

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
            ? 'CREATE ACCOUNT'
            : viewMode === 'edit'
              ? 'EDIT ACCOUNT'
              : viewMode === 'view'
                ? 'VIEW ACCOUNT'
                : 'ACCOUNT RECORDS'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {viewMode !== 'create' && (
            <Button variant="outlined" onClick={handleCreateNew} startIcon={<AddIcon />}>
              Create New
            </Button>
          )}
          {viewMode !== 'list' && (
            <Button variant="outlined" onClick={handleViewAccountList}>
              View All
            </Button>
          )}
          {viewMode === 'view' && selectedAccount && (
            <>
              <Tooltip title="Print Account Details">
                <IconButton color="secondary" sx={{ border: `1px solid ${theme.palette.secondary.main}` }}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Email Account Details">
                <IconButton color="success" sx={{ border: `1px solid ${theme.palette.success.main}` }}>
                  <EmailIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
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
        <AccountList
          accounts={accounts}
          loading={accountsLoading}
          error={accountsError}
          onViewAccount={handleViewAccount}
          onEditAccount={handleEditAccount}
          onRefetch={refetchAccounts}
          totalAccounts={totalAccounts}
          totalBalance={totalBalance}
          totalCreditLimit={totalCreditLimit}
          onCreateAccount={handleCreateNew}
        />
      )}

      {viewMode === 'view' && <AccountDetail account={selectedAccount} onBack={handleViewAccountList} onEdit={handleEditAccount} />}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <AccountForm
          mode={viewMode}
          account={selectedAccount}
          onSave={handleMessage}
          onCancel={handleViewAccountList}
          onRefetch={refetchAccounts}
        />
      )}
    </Box>
  );
};

export default Account;
