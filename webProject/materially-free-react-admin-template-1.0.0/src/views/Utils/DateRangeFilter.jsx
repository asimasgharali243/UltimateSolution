import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  useMediaQuery,
  useTheme,
  Collapse,
  Tooltip,
  Typography // Added missing import
} from '@mui/material';
import {
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';

const DateRangeFilter = ({
  filters = {},
  onFilterChange = () => {},
  onClearFilters = () => {},
  label = 'Date Range',
  showClearButton = true,
  size = 'small',
  variant = 'outlined',
  compact = false,
  showQuickSelect = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [expanded, setExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    dateRange: 'This Week',
    dateFrom: '',
    dateTo: '',
    ...filters
  });

  // Sync with external filters
  useEffect(() => {
    setLocalFilters((prev) => ({
      ...prev,
      ...filters
    }));
  }, [filters]);

  const dateRangeOptions = [
    // Quick ranges
    { value: 'Today', label: 'Today', quick: true },
    { value: 'Yesterday', label: 'Yesterday', quick: true },
    { value: 'This Week', label: 'This Week', quick: true },
    { value: 'This Week to Date', label: 'This Week to Date', quick: true },
    { value: 'This Month', label: 'This Month', quick: true },
    { value: 'This Month to Date', label: 'This Month to Date', quick: true },
    { value: 'Last Week', label: 'Last Week', quick: true },
    { value: 'Last Week to Date', label: 'Last Week to Date', quick: true },

    // Since ranges
    { value: 'Since 30 Day Ago', label: 'Since 30 Day Ago', quick: true },
    { value: 'Since 60 Day Ago', label: 'Since 60 Day Ago', quick: true },
    { value: 'Since 90 Day Ago', label: 'Since 90 Day Ago', quick: true },
    { value: 'Since 365 Day Ago', label: 'Since 365 Day Ago', quick: true },

    // Financial year
    { value: 'Current Financial Year', label: 'Current Financial Year', quick: false },
    { value: 'Current Financial Year to Date', label: 'Current Financial Year to Date', quick: false },

    // Quarters
    { value: 'Quarter 1', label: 'Quarter 1 (Jan-Mar)', quick: false },
    { value: 'Quarter 2', label: 'Quarter 2 (Apr-Jun)', quick: false },
    { value: 'Quarter 3', label: 'Quarter 3 (Jul-Sep)', quick: false },
    { value: 'Quarter 4', label: 'Quarter 4 (Oct-Dec)', quick: false },

    // Custom range
    { value: 'Custom Range', label: 'Custom Range', quick: false }
  ];

  const quickOptions = dateRangeOptions.filter((opt) => opt.quick);
  const allOptions = dateRangeOptions;

  // Get financial year start (assuming April 1st as start)
  const getFinancialYearStart = (date = new Date()) => {
    const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
    return new Date(year, 3, 1); // April 1st
  };

  const getDateRangeForFilter = (range) => {
    const now = new Date();
    let fromDate, toDate;

    switch (range) {
      case 'Today':
        fromDate = new Date(now);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Yesterday':
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 1);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(fromDate);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'This Week':
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - now.getDay());
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setDate(now.getDate() + (6 - now.getDay()));
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'This Week to Date':
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - now.getDay());
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'This Month':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'This Month to Date':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Last Week':
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - now.getDay() - 7);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(fromDate);
        toDate.setDate(fromDate.getDate() + 6);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Last Week to Date':
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - now.getDay() - 7);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Since 30 Day Ago':
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 30);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Since 60 Day Ago':
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 60);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Since 90 Day Ago':
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 90);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Since 365 Day Ago':
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 365);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Current Financial Year':
        fromDate = getFinancialYearStart();
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(fromDate.getFullYear() + 1, 2, 31); // March 31st of next year
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Current Financial Year to Date':
        fromDate = getFinancialYearStart();
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Quarter 1':
        fromDate = new Date(now.getFullYear(), 0, 1); // Jan 1
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now.getFullYear(), 2, 31); // Mar 31
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Quarter 2':
        fromDate = new Date(now.getFullYear(), 3, 1); // Apr 1
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now.getFullYear(), 5, 30); // Jun 30
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Quarter 3':
        fromDate = new Date(now.getFullYear(), 6, 1); // Jul 1
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now.getFullYear(), 8, 30); // Sep 30
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'Quarter 4':
        fromDate = new Date(now.getFullYear(), 9, 1); // Oct 1
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now.getFullYear(), 11, 31); // Dec 31
        toDate.setHours(23, 59, 59, 999);
        break;

      default:
        return null;
    }

    return { fromDate, toDate };
  };

  const handleDateRangeChange = (value) => {
    const newFilters = { ...localFilters, dateRange: value };

    if (value !== 'Custom Range') {
      const dateRange = getDateRangeForFilter(value);
      if (dateRange) {
        newFilters.dateFrom = dateRange.fromDate.toISOString().split('T')[0];
        newFilters.dateTo = dateRange.toDate.toISOString().split('T')[0];
      }
    } else {
      // For custom range, clear the auto-filled dates
      newFilters.dateFrom = '';
      newFilters.dateTo = '';
    }

    setLocalFilters(newFilters);
    onFilterChange('dateRange', value);
    if (newFilters.dateFrom) onFilterChange('dateFrom', newFilters.dateFrom);
    if (newFilters.dateTo) onFilterChange('dateTo', newFilters.dateTo);

    // Auto-collapse on mobile after selection
    if (isMobile) {
      setExpanded(false);
    }
  };

  const handleDateChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(field, value);
  };

  const handleQuickSelect = (value) => {
    handleDateRangeChange(value);
  };

  const handleClearFilters = () => {
    const defaultDateRange = getDateRangeForFilter('This Week');
    const defaultFilters = {
      dateRange: 'This Week',
      dateFrom: defaultDateRange ? defaultDateRange.fromDate.toISOString().split('T')[0] : '',
      dateTo: defaultDateRange ? defaultDateRange.toDate.toISOString().split('T')[0] : ''
    };

    setLocalFilters(defaultFilters);
    onClearFilters(defaultFilters);
  };

  const isCustomRange = localFilters.dateRange === 'Custom Range';
  const hasActiveFilters = localFilters.dateFrom || localFilters.dateTo;

  // Auto-expand on mobile when custom range is selected
  useEffect(() => {
    if (isCustomRange && isMobile) {
      setExpanded(true);
    }
  }, [isCustomRange, isMobile]);

  // Desktop Layout - Single Compact Row
  const renderDesktopLayout = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'nowrap',
        minWidth: compact ? 'auto' : 600
      }}
    >
      {/* Quick Select Chips - Only show when not compact */}
      {showQuickSelect && !compact && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            flexShrink: 0,
            maxWidth: 300,
            overflowX: 'auto',
            py: 0.5
          }}
        >
          {quickOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              size="small"
              variant={localFilters.dateRange === option.value ? 'filled' : 'outlined'}
              color={localFilters.dateRange === option.value ? 'primary' : 'default'}
              onClick={() => handleQuickSelect(option.value)}
              clickable
              sx={{
                fontSize: '0.7rem',
                height: '24px',
                minWidth: 'auto',
                px: 0.5,
                flexShrink: 0
              }}
            />
          ))}
        </Box>
      )}

      {/* Date Range Select */}
      <FormControl size={size} variant={variant} sx={{ minWidth: 160, flexShrink: 0 }}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={localFilters.dateRange || 'This Week'}
          label={label}
          onChange={(e) => handleDateRangeChange(e.target.value)}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 300,
                '& .MuiMenuItem-root': {
                  fontSize: '0.875rem'
                }
              }
            }
          }}
        >
          {allOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Date From Field */}
      <TextField
        size={size}
        label="From"
        type="date"
        value={localFilters.dateFrom || ''}
        onChange={(e) => handleDateChange('dateFrom', e.target.value)}
        InputLabelProps={{ shrink: true }}
        variant={variant}
        sx={{ width: 130, flexShrink: 0 }}
        disabled={!isCustomRange}
      />

      {/* Date To Field */}
      <TextField
        size={size}
        label="To"
        type="date"
        value={localFilters.dateTo || ''}
        onChange={(e) => handleDateChange('dateTo', e.target.value)}
        InputLabelProps={{ shrink: true }}
        variant={variant}
        sx={{ width: 130, flexShrink: 0 }}
        disabled={!isCustomRange}
      />

      {/* Clear Button */}
      {showClearButton && hasActiveFilters && (
        <Tooltip title="Clear date range">
          <IconButton
            size="small"
            onClick={handleClearFilters}
            sx={{
              flexShrink: 0,
              ml: 0.5
            }}
          >
            {/* <ClearIcon /> */}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  // Mobile Layout - Collapsible
  const renderMobileLayout = () => (
    <Box>
      {/* Mobile Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
          backgroundColor: expanded ? 'action.hover' : 'transparent',
          borderRadius: 1,
          border: `1px solid ${expanded ? theme.palette.primary.main : theme.palette.divider}`
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color={hasActiveFilters ? 'primary' : 'action'} />
          <Box>
            <Typography variant="subtitle2">Date Range</Typography>
            <Typography variant="caption" color="text.secondary">
              {hasActiveFilters ? localFilters.dateRange : 'Tap to select'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasActiveFilters && <Chip label={localFilters.dateRange} size="small" color="primary" variant="outlined" />}
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>

      {/* Mobile Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mt: 1 }}>
          {/* Quick Select Chips */}
          {showQuickSelect && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Select
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 120, overflowY: 'auto' }}>
                {quickOptions.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    size="small"
                    variant={localFilters.dateRange === option.value ? 'filled' : 'outlined'}
                    color={localFilters.dateRange === option.value ? 'primary' : 'default'}
                    onClick={() => handleQuickSelect(option.value)}
                    clickable
                    sx={{ flexShrink: 0 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Date Range Select */}
          <FormControl fullWidth size={size} variant={variant} sx={{ mb: 2 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={localFilters.dateRange || 'This Week'}
              label="Date Range"
              onChange={(e) => handleDateRangeChange(e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    '& .MuiMenuItem-root': {
                      fontSize: '0.875rem'
                    }
                  }
                }
              }}
            >
              {allOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Fields */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              size={size}
              label="From Date"
              type="date"
              value={localFilters.dateFrom || ''}
              onChange={(e) => handleDateChange('dateFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant={variant}
              disabled={!isCustomRange}
            />
            <TextField
              fullWidth
              size={size}
              label="To Date"
              type="date"
              value={localFilters.dateTo || ''}
              onChange={(e) => handleDateChange('dateTo', e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant={variant}
              disabled={!isCustomRange}
            />
          </Box>

          {/* Clear Button */}
          {hasActiveFilters && (
            <Button fullWidth size="small" startIcon={<ClearIcon />} onClick={handleClearFilters} variant="outlined">
              Clear Dates
            </Button>
          )}
        </Box>
      </Collapse>
    </Box>
  );

  // Choose layout based on screen size
  if (isMobile) {
    return renderMobileLayout();
  } else {
    return renderDesktopLayout();
  }
};

export default DateRangeFilter;
