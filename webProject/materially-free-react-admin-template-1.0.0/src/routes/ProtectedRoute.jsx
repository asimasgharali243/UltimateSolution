// components/ProtectedRoute.jsx
import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkTokenExpiry, validateToken, forceLogout } from '../store/slices/authSlice';
import { jwtDecode } from 'jwt-decode';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, requiredPermissions = [], requireAnyPermission = false }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, token, tokenValid, loading } = useSelector((state) => state.auth);

  // Check if user is admin
  const isAdmin = useMemo(() => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.role === 'admin' || decoded.isAdmin === true || decoded.isAdministrator === true;
    } catch (error) {
      return false;
    }
  }, [token]);

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

  // Check permissions if required
  const hasRequiredPermissions = useMemo(() => {
    if (requiredPermissions.length === 0) return true;
    if (isAdmin) return true; // Admin has all permissions
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);

      if (requireAnyPermission) {
        return requiredPermissions.some(({ formName, permission }) => {
          const permissionClaim = `right_${formName}_${permission}`;
          return decoded[permissionClaim] === 'true';
        });
      } else {
        return requiredPermissions.every(({ formName, permission }) => {
          const permissionClaim = `right_${formName}_${permission}`;
          return decoded[permissionClaim] === 'true';
        });
      }
    } catch (error) {
      return false;
    }
  }, [requiredPermissions, requireAnyPermission, token, isAdmin]);

  // Check if user has at least one permission for the form
  const hasAnyPermissionForForm = useMemo(() => {
    if (requiredPermissions.length === 0) return true;
    if (isAdmin) return true; // Admin has all permissions
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const formNames = [...new Set(requiredPermissions.map((p) => p.formName))];

      return formNames.some((formName) => {
        const permissions = ['view', 'save', 'update', 'delete', 'post'];
        return permissions.some((permission) => {
          const permissionClaim = `right_${formName}_${permission}`;
          return decoded[permissionClaim] === 'true';
        });
      });
    } catch (error) {
      return false;
    }
  }, [requiredPermissions, token, isAdmin]);

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
    return <Navigate to="/application/login" state={{ from: location }} replace />;
  }

  if (!hasAnyPermissionForForm) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column" gap={2}>
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography variant="h6" color="textSecondary">
          You don't have any permissions to access this page.
        </Typography>
      </Box>
    );
  }

  if (!hasRequiredPermissions) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column" gap={2}>
        <Typography variant="h4" color="error">
          Insufficient Permissions
        </Typography>
        <Typography variant="h6" color="textSecondary">
          You don't have the required permissions to access this page.
        </Typography>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
