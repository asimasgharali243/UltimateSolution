// hooks/usePermissions.js
import { useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

export const usePermissions = () => {
  // Check if user is admin
  const isAdmin = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🔍 DEBUG - No token found for admin check');
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      const adminStatus = decoded.role === 'admin' || decoded.isAdmin === true || decoded.isAdmin === 'true';
      
      console.log('🔍 DEBUG - Admin Check Result:', {
        role: decoded.role,
        isAdmin: decoded.isAdmin,
        isAdministrator: decoded.isAdministrator,
        result: adminStatus,
        allClaims: decoded
      });
      
      return adminStatus;
    } catch (error) {
      console.error('🔍 DEBUG - Error decoding token for admin check:', error);
      return false;
    }
  }, []);

  // Check if user has any permission for a specific form
  const hasAnyPermissionForForm = useCallback((formName) => {
    // Admin users have all permissions
    if (isAdmin()) {
      console.log(`🔍 DEBUG - Admin user detected, granting permission for: ${formName}`);
      return true;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log(`🔍 DEBUG - No token found for form permission check: ${formName}`);
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      const permissions = ['view', 'save', 'update', 'delete', 'post'];
      
      const hasPermission = permissions.some(permission => {
        const permissionClaim = `right_${formName}_${permission}`;
        const hasClaim = decoded[permissionClaim] === 'true';
        
        if (hasClaim) {
          console.log(`🔍 DEBUG - Permission found: ${permissionClaim} = true`);
        }
        
        return hasClaim;
      });

      console.log(`🔍 DEBUG - hasAnyPermissionForForm ${formName}: ${hasPermission}`);
      
      if (!hasPermission) {
        console.log(`🔍 DEBUG - No permissions found for form: ${formName}`);
        // Log all available permission claims for debugging
        const permissionClaims = Object.keys(decoded).filter(key => key.startsWith('right_'));
        console.log(`🔍 DEBUG - Available permission claims:`, permissionClaims);
      }
      
      return hasPermission;
    } catch (error) {
      console.error(`🔍 DEBUG - Error checking permissions for form ${formName}:`, error);
      return false;
    }
  }, [isAdmin]);

  // Get specific permissions for a form
  const getFormPermissions = useCallback((formName) => {
    // Admin users have all permissions
    if (isAdmin()) {
      return {
        view: true,
        save: true,
        update: true,
        delete: true,
        post: true
      };
    }

    const token = localStorage.getItem('token');
    if (!token) return {
      view: false,
      save: false,
      update: false,
      delete: false,
      post: false
    };

    try {
      const decoded = jwtDecode(token);
      const permissions = {
        view: decoded[`right_${formName}_view`] === 'true',
        save: decoded[`right_${formName}_save`] === 'true',
        update: decoded[`right_${formName}_update`] === 'true',
        delete: decoded[`right_${formName}_delete`] === 'true',
        post: decoded[`right_${formName}_post`] === 'true'
      };
      
      console.log(`🔍 DEBUG - getFormPermissions ${formName}:`, permissions);
      return permissions;
    } catch (error) {
      console.error('🔍 DEBUG - Error getting form permissions:', formName, error);
      return {
        view: false,
        save: false,
        update: false,
        delete: false,
        post: false
      };
    }
  }, [isAdmin]);

  // Get all accessible forms
  const getAccessibleForms = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🔍 DEBUG - No token found for accessible forms');
      return [];
    }

    try {
      const decoded = jwtDecode(token);
      const accessibleForms = [];
      
      // Define all form names we're checking
      const formNames = [
        'query', 'quotation', 'pricelist', 'userrights', 'city', 
        'hotel', 'package', 'pax', 'ratehotel', 'ratevisa', 'sector'
      ];

      formNames.forEach(formName => {
        const hasAnyPermission = ['view', 'save', 'update', 'delete', 'post'].some(permission => 
          decoded[`right_${formName}_${permission}`] === 'true'
        );
        
        if (hasAnyPermission) {
          accessibleForms.push(formName);
        }
      });

      console.log('🔍 DEBUG - Accessible Forms:', accessibleForms);
      return accessibleForms;
    } catch (error) {
      console.error('🔍 DEBUG - Error getting accessible forms:', error);
      return [];
    }
  }, []);

  return {
    hasAnyPermissionForForm,
    getFormPermissions,
    isAdmin,
    getAccessibleForms,
  };
};