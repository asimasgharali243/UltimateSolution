// src/views/Dashboard/Advertisement/AdvertisementPrintView.jsx
import React, { forwardRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const AdvertisementPrintView = forwardRef(({ formData, detailRecords, selectedClient, totals }, ref) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <Box ref={ref} sx={{ p: 3, fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '2px solid #000', pb: 2 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#1976d2', mb: 1 }}>
          DAILY GUJRANWALA TIMES
        </Typography>
        <Typography variant="h6" sx={{ color: '#666' }}>
          Advertisement Bill
        </Typography>
      </Box>

      {/* Bill Information */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography>
            <strong>Bill No:</strong> {formData.billNo || '______'}
          </Typography>
          <Typography>
            <strong>Date:</strong> {formatDate(formData.billDate) || '______'}
          </Typography>
        </Box>
        <Box>
          <Typography>
            <strong>Voucher No:</strong> {formData.vNo || '______'}
          </Typography>
          <Typography>
            <strong>RO No:</strong> {formData.roNo || '______'}
          </Typography>
          <Typography>
            <strong>RO Date:</strong> {formatDate(formData.roDate) || '______'}
          </Typography>
        </Box>
      </Box>

      {/* Client Information */}
      <Box sx={{ mb: 3 }}>
        <Typography>
          <strong>Client M/S:</strong> {selectedClient?.fullName || '______'}
        </Typography>
        <Typography>
          <strong>Agency:</strong> {formData.agencyName || '______'}
        </Typography>
        <Typography>
          <strong>PID:</strong> {formData.pID || '______'}
        </Typography>
        <Typography>
          <strong>Caption:</strong> {formData.caption || '______'}
        </Typography>
      </Box>

      {/* Advertisement Details Table */}
      <TableContainer component={Paper} sx={{ mb: 3, border: '1px solid #000' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Insertion Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Color</TableCell>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Size</TableCell>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Total Space</TableCell>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Position</TableCell>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Rate</TableCell>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detailRecords.map((record, index) => {
              const spaceValue = parseInt(record.totalSpace) || 0;
              const amount = record.rate * spaceValue;
              return (
                <TableRow key={index}>
                  <TableCell sx={{ border: '1px solid #000' }}>{formatDate(record.inserationDate)}</TableCell>
                  <TableCell sx={{ border: '1px solid #000' }}>{record.color}</TableCell>
                  <TableCell sx={{ border: '1px solid #000' }}>{record.size}</TableCell>
                  <TableCell sx={{ border: '1px solid #000' }}>{record.totalSpace}</TableCell>
                  <TableCell sx={{ border: '1px solid #000' }}>{record.position}</TableCell>
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'right' }}>{formatCurrency(record.rate)}</TableCell>
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'right' }}>{formatCurrency(amount)}</TableCell>
                </TableRow>
              );
            })}
            {detailRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ border: '1px solid #000', py: 2 }}>
                  No advertisement details
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totals Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>
            <strong>Advertisement Amount:</strong>
          </Typography>
          <Typography>
            <strong>{formatCurrency(totals.totalAmount)}</strong>
          </Typography>
        </Box>
        {formData.frontPageExtra > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Front Page {formData.frontPageExtra}% Extra:</Typography>
            <Typography>{formatCurrency((totals.totalAmount * formData.frontPageExtra) / 100)}</Typography>
          </Box>
        )}
        {formData.backPageExtra > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Back Page {formData.backPageExtra}% Extra:</Typography>
            <Typography>{formatCurrency((totals.totalAmount * formData.backPageExtra) / 100)}</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, borderTop: '1px solid #000', pt: 1 }}>
          <Typography>
            <strong>Total:</strong>
          </Typography>
          <Typography>
            <strong>{formatCurrency(totals.grossTotal)}</strong>
          </Typography>
        </Box>
        {formData.comission > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>
              <strong>Commission:</strong>
            </Typography>
            <Typography>
              <strong>{formatCurrency(formData.comission)}</strong>
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, borderTop: '1px solid #000', pt: 1 }}>
          <Typography>
            <strong>Net Amount:</strong>
          </Typography>
          <Typography>
            <strong>{formatCurrency(totals.netAmount)}</strong>
          </Typography>
        </Box>
      </Box>

      {/* Amount in Words */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #000', backgroundColor: '#f9f9f9' }}>
        <Typography>
          <strong>In Words:</strong> {totals.netAmount ? `Rupees ${convertToWords(totals.netAmount)} Only` : '______'}
        </Typography>
      </Box>

      {/* Footer Notes */}
      <Box sx={{ mt: 4, p: 2, border: '1px solid #000', backgroundColor: '#fff3cd' }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>1. Please quote bill when remitting payment.</strong>
        </Typography>
        <Typography variant="body2">
          <strong>2. All payments should be made through Crossed Cheques / Pay Order in the name of Daily Gujranwala Times</strong>
        </Typography>
      </Box>

      {/* Signature Section */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ borderTop: '1px solid #000', width: 200, pt: 1 }}>
            <strong>Checked By</strong>
          </Typography>
          <Typography variant="body2">Manager Marketing / Advertisement</Typography>
        </Box>
      </Box>
    </Box>
  );
});

// Helper function to convert numbers to words
const convertToWords = (num) => {
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  let words = '';

  if (Math.floor(num / 10000000) > 0) {
    words += convertToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }

  if (Math.floor(num / 100000) > 0) {
    words += convertToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }

  if (Math.floor(num / 1000) > 0) {
    words += convertToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }

  if (Math.floor(num / 100) > 0) {
    words += convertToWords(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }

  if (num > 0) {
    if (words !== '') words += 'and ';

    if (num < 20) {
      words += a[num];
    } else {
      words += b[Math.floor(num / 10)];
      if (num % 10 > 0) {
        words += '-' + a[num % 10];
      }
    }
  }

  return words.trim();
};

AdvertisementPrintView.displayName = 'AdvertisementPrintView';

export default AdvertisementPrintView;
