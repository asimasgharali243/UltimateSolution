// components/FormNameDebugger.jsx
import React from 'react';
import { jwtDecode } from 'jwt-decode';
import { Paper, Typography, Box, Button } from '@mui/material';

const FormNameDebugger = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <Paper sx={{ p: 2, m: 2, bgcolor: 'error.light' }}>
        <Typography variant="h6">No token found!</Typography>
      </Paper>
    );
  }

  const decoded = jwtDecode(token);
  const permissionClaims = Object.keys(decoded).filter((key) => key.startsWith('right_'));

  // Extract actual form names from permission claims
  const actualFormNames = permissionClaims.map((claim) => {
    const parts = claim.split('_');
    return parts[1]; // The form name is the second part
  });

  const uniqueFormNames = [...new Set(actualFormNames)];

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <Paper sx={{ p: 2, m: 2, bgcolor: 'success.light' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Form Name Debugger</Typography>
        <Button variant="contained" onClick={refreshPage}>
          Refresh
        </Button>
      </Box>

      <Typography variant="body2" mt={1}>
        <strong>Actual Form Names in JWT Token:</strong>
      </Typography>

      {uniqueFormNames.map((formName) => (
        <Box key={formName} display="flex" gap={1} alignItems="center">
          <Typography variant="body2" fontFamily="monospace">
            {formName}
          </Typography>
          <Typography variant="body2" color="success.main">
            ✅
          </Typography>
        </Box>
      ))}

      <Typography variant="body2" mt={2}>
        <strong>Total Permission Claims:</strong> {permissionClaims.length}
      </Typography>

      <Typography variant="body2" mt={1}>
        <strong>Use these EXACT form names in your menu configuration:</strong>
      </Typography>

      <Box component="pre" sx={{ bgcolor: 'black', color: 'white', p: 1, borderRadius: 1, mt: 1 }}>
        {`// Use these exact form names:\nconst setupForms = [\n${uniqueFormNames.map((name) => `  { formName: '${name}' },`).join('\n')}\n];`}
      </Box>
    </Paper>
  );
};

export default FormNameDebugger;
