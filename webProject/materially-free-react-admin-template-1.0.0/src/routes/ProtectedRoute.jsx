// components/ProtectedRoute.jsx
import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkTokenExpiry, validateToken } from '../store/slices/authSlice';
import { jwtDecode } from 'jwt-decode';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({
  children,
  requiredForm = null,
  requiredPermissions = null,
  requireAnyPermission = true,
  adminOnly = false,
  requireAuthentication = false
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, token, tokenValid, loading } = useSelector((state) => state.auth);

  // Helper function to normalize form names
  const normalizeFormName = (formName) => {
    if (!formName) return null;

    // Map common variations to standard names from your database
    const formNameMap = {
      quotation: 'Quotation',
      pricelist: 'PrceList',
      master: 'Advertisement',
      query: 'QueryForm',
      purchase: 'Purchase',
      invoice: 'Invoice',
      deliverynote: 'DeliveryNote',
      changepassword: 'ChangePassword',
      userrights: 'UserRights',
      printing: 'Printing',
      stockconsumption: 'Purchase' // Assuming Purchase is used for stock consumption
    };

    return formNameMap[formName.toLowerCase()] || formName;
  };

  // Check if user is admin
  const isAdmin = useMemo(() => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const adminStatus = decoded.role === 'admin' || decoded.isAdmin === true || decoded.isAdmin === 'true';
      console.log(`🔍 DEBUG - ProtectedRoute Admin Check: ${adminStatus}`);
      return adminStatus;
    } catch (error) {
      console.error('🔍 DEBUG - Error decoding token for admin check:', error);
      return false;
    }
  }, [token]);

  // Define admin-only forms (forms that are NOT in your database)
  const adminOnlyForms = [
    'City',
    'Hotel',
    'Package',
    'Pax',
    'RateHotel',
    'RateVisa',
    'Sector',
    'Account',
    'ItemGroup',
    'ItemCategory',
    'StockProduction'
  ];

  // Determine the form name to check (with normalization)
  const formToCheck = useMemo(() => {
    if (requiredForm) return normalizeFormName(requiredForm);
    if (requiredPermissions && requiredPermissions.length > 0) {
      return normalizeFormName(requiredPermissions[0].formName);
    }
    return null;
  }, [requiredForm, requiredPermissions]);

  // Check if user has permission for the route
  const hasPermission = useMemo(() => {
    // Admin users have all permissions
    if (isAdmin) {
      console.log(`🔍 DEBUG - Admin access granted for form: ${formToCheck}`);
      return true;
    }

    // No form requirement - allow access if just authentication is required
    if (!formToCheck && (requireAuthentication || requiredPermissions)) {
      console.log(`🔍 DEBUG - Basic authentication required, allowing access`);
      return true;
    }

    // No form requirement and no authentication requirement - allow access
    if (!formToCheck && !requireAuthentication) {
      console.log(`🔍 DEBUG - No form requirement, allowing access`);
      return true;
    }

    // Check if this is an admin-only form
    if (adminOnlyForms.includes(formToCheck)) {
      console.log(`🔍 DEBUG - Access denied: ${formToCheck} is admin-only`);
      return false;
    }

    if (!token) return false;

    try {
      const decoded = jwtDecode(token);

      // Debug: Log all available permissions
      console.log('🔍 DEBUG - All available permission claims:');
      Object.keys(decoded).forEach((key) => {
        if (key.startsWith('right_') && decoded[key] === 'true') {
          console.log(`   ✅ ${key}: ${decoded[key]}`);
        }
      });

      // If using requiredPermissions array, check specific permissions
      if (requiredPermissions && requiredPermissions.length > 0) {
        if (requireAnyPermission) {
          // Check if user has ANY of the required permissions
          const hasAnyRequired = requiredPermissions.some(({ formName, permission }) => {
            const normalizedFormName = normalizeFormName(formName);
            const permissionClaim = `right_${normalizedFormName}_${permission}`;
            const hasClaim = decoded[permissionClaim] === 'true';
            if (hasClaim) {
              console.log(`🔍 DEBUG - Permission found: ${permissionClaim}`);
            }
            return hasClaim;
          });

          console.log(`🔍 DEBUG - Any permission check for ${formToCheck}: ${hasAnyRequired}`);
          return hasAnyRequired;
        } else {
          // Check if user has ALL required permissions
          const hasAllRequired = requiredPermissions.every(({ formName, permission }) => {
            const normalizedFormName = normalizeFormName(formName);
            const permissionClaim = `right_${normalizedFormName}_${permission}`;
            return decoded[permissionClaim] === 'true';
          });

          console.log(`🔍 DEBUG - All permissions check for ${formToCheck}: ${hasAllRequired}`);
          return hasAllRequired;
        }
      }

      // Fallback to any permission check for the form
      const permissions = ['view', 'save', 'update', 'delete', 'post'];
      const hasAnyPermission = permissions.some((permission) => {
        const permissionClaim = `right_${formToCheck}_${permission}`;
        const hasClaim = decoded[permissionClaim] === 'true';
        if (hasClaim) {
          console.log(`🔍 DEBUG - Permission found: ${permissionClaim}`);
        }
        return hasClaim;
      });

      console.log(`🔍 DEBUG - Any permission check for "${formToCheck}": ${hasAnyPermission}`);
      return hasAnyPermission;
    } catch (error) {
      console.error(`🔍 DEBUG - Error checking permissions for form ${formToCheck}:`, error);
      return false;
    }
  }, [formToCheck, requiredPermissions, requireAnyPermission, requireAuthentication, token, isAdmin, adminOnlyForms]);

  // Check token expiry on mount and periodically
  useEffect(() => {
    if (token) {
      dispatch(checkTokenExpiry());
      dispatch(validateToken());

      const interval = setInterval(() => {
        dispatch(checkTokenExpiry());
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [dispatch, token]);

  // Safety check - redirect if unauthorized
  useEffect(() => {
    if ((requireAuthentication || formToCheck) && (!isAuthenticated || !tokenValid)) {
      console.log('🛡️ Safety check: Redirecting unauthorized access');
      navigate('/application/login', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, tokenValid, navigate, location, requireAuthentication, formToCheck]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column" gap={2}>
        <CircularProgress />
        <Typography variant="h6" color="textSecondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated || !tokenValid) {
    console.log('🔍 DEBUG - Not authenticated, redirecting to login');
    return <Navigate to="/application/login" state={{ from: location }} replace />;
  }

  // Admin only routes
  if (adminOnly && !isAdmin) {
    console.log(`🔍 DEBUG - Access denied: Admin required for route`);
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column" gap={2}>
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography variant="h6" color="textSecondary">
          This page is only accessible to administrators.
        </Typography>
      </Box>
    );
  }

  // Form permission check for non-admin users
  if ((formToCheck || requiredPermissions) && !hasPermission) {
    console.log(`🔍 DEBUG - Access denied: No permissions for form ${formToCheck}`);
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column" gap={2}>
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography variant="h6" color="textSecondary">
          You don't have permission to access this page.
        </Typography>
      </Box>
    );
  }

  console.log(`🔍 DEBUG - Access granted for route with form: ${formToCheck}`);
  return children;
};

export default ProtectedRoute;
