// hooks/usePermissions.js
import { useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';
import { useGetFormsQuery } from '../store/api/userRightsApi';

export const usePermissions = () => {
  const { token } = useSelector((state) => state.auth);
  
  // Fetch forms from database
  const { data: formsData, isLoading: formsLoading, error: formsError } = useGetFormsQuery();

  // Helper function to normalize form names
  const normalizeFormName = useCallback((formName) => {
    if (!formName) return null;
    
    const formNameMap = {
      'quotation': 'Quotation',
      'pricelist': 'PrceList', 
      'master': 'Advertisement',
      'query': 'QueryForm',
      'purchase': 'Purchase',
      'invoice': 'Invoice',
      'deliverynote': 'DeliveryNote',
      'changepassword': 'ChangePassword',
      'userrights': 'UserRights',
      'printing': 'Printing',
      'stockconsumption': 'Purchase'
    };
    
    return formNameMap[formName.toLowerCase()] || formName;
  }, []);

  // Get all forms from database or fallback
  const allForms = useMemo(() => {
    if (formsData && Array.isArray(formsData) && formsData.length > 0) {
      console.log('🔍 DEBUG - Forms loaded from database:', formsData);
      
      return formsData.map(form => ({
        formName: form.formName?.trim(),
        displayName: form.formDisplayName || form.formName,
        formID: form.formID,
        menu: form.menu || form.Menu,
        sortOrder: form.sortOrder
      })).filter(form => form.formName);
    }

    // Enhanced fallback forms that match your database structure
    console.log('🔍 DEBUG - Using enhanced fallback forms');
    const fallbackForms = [
      { formName: 'QueryForm', displayName: 'Query Form', menu: 'Agency', sortOrder: 1 },
      { formName: 'Quotation', displayName: 'Quotation Form', menu: 'Agency', sortOrder: 2 },
      { formName: 'PrceList', displayName: 'Price List', menu: 'Agency', sortOrder: 3 },
      { formName: 'City', displayName: 'City Form', menu: 'Setup', sortOrder: 4 },
      { formName: 'Hotel', displayName: 'Hotel Form', menu: 'Setup', sortOrder: 5 },
      { formName: 'Package', displayName: 'Package Form', menu: 'Setup', sortOrder: 6 },
      { formName: 'Pax', displayName: 'Pax Form', menu: 'Setup', sortOrder: 7 },
      { formName: 'RateHotel', displayName: 'Rate Hotel', menu: 'Setup', sortOrder: 8 },
      { formName: 'RateVisa', displayName: 'Rate Visa', menu: 'Setup', sortOrder: 9 },
      { formName: 'Sector', displayName: 'Sector Form', menu: 'Setup', sortOrder: 10 },
      { formName: 'Advertisement', displayName: 'Advertisement', menu: 'Advertisment', sortOrder: 11 },
      { formName: 'Printing', displayName: 'Printing', menu: 'Advertisment', sortOrder: 12 },
      { formName: 'Account', displayName: 'Account Records', menu: 'Setup', sortOrder: 13 },
      { formName: 'ItemGroup', displayName: 'Item Group Form', menu: 'Setup', sortOrder: 14 },
      { formName: 'ItemCategory', displayName: 'Item Category Form', menu: 'Setup', sortOrder: 15 },
      { formName: 'StockProduction', displayName: 'Stock Production Form', menu: 'Setup', sortOrder: 16 },
      { formName: 'UserRights', displayName: 'User Rights Form', menu: 'Security', sortOrder: 17 },
      { formName: 'ChangePassword', displayName: 'Change Password', menu: 'Security', sortOrder: 18 },
      { formName: 'Purchase', displayName: 'Purchase', menu: 'Transacation', sortOrder: 19 },
      { formName: 'Invoice', displayName: 'Invoice', menu: 'Transacation', sortOrder: 20 },
      { formName: 'DeliveryNote', displayName: 'Delivery Note', menu: 'Transacation', sortOrder: 21 }
    ];

    return fallbackForms;
  }, [formsData]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
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
        result: adminStatus
      });
      
      return adminStatus;
    } catch (error) {
      console.error('🔍 DEBUG - Error decoding token for admin check:', error);
      return false;
    }
  }, [token]);

  // Enhanced permission check with form name normalization
  const hasAnyPermissionForForm = useCallback((formName) => {
    if (!formName) {
      console.log('🔍 DEBUG - No form name provided for permission check');
      return false;
    }

    // Normalize form name first
    const normalizedFormName = normalizeFormName(formName);
    console.log(`🔍 DEBUG - Checking permissions for form: "${formName}" -> normalized: "${normalizedFormName}"`);

    // Admin users have all permissions
    if (isAdmin()) {
      console.log(`🔍 DEBUG - Admin user detected, granting permission for: ${normalizedFormName}`);
      return true;
    }

    if (!token) {
      console.log(`🔍 DEBUG - No token found for form permission check: ${normalizedFormName}`);
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      const permissions = ['view', 'save', 'update', 'delete', 'post'];
      
      // Try multiple naming conventions
      const formNameVariations = [
        normalizedFormName,
        normalizedFormName.toLowerCase(),
        normalizedFormName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
        normalizedFormName.replace(/\s+/g, '')
      ];

      const hasPermission = permissions.some(permission => {
        return formNameVariations.some(formVar => {
          const permissionClaim = `right_${formVar}_${permission}`;
          const hasClaim = decoded[permissionClaim] === 'true';
          
          if (hasClaim) {
            console.log(`🔍 DEBUG - Permission found: ${permissionClaim} = true`);
          }
          
          return hasClaim;
        });
      });

      console.log(`🔍 DEBUG - hasAnyPermissionForForm "${normalizedFormName}": ${hasPermission}`);
      
      if (!hasPermission) {
        console.log(`🔍 DEBUG - No permissions found for form: ${normalizedFormName}`);
        // Log available claims for debugging
        const availableClaims = Object.keys(decoded).filter(key => 
          key.startsWith('right_') && decoded[key] === 'true'
        );
        if (availableClaims.length > 0) {
          console.log(`🔍 DEBUG - Available true permission claims:`, availableClaims);
        }
      }
      
      return hasPermission;
    } catch (error) {
      console.error(`🔍 DEBUG - Error checking permissions for form ${normalizedFormName}:`, error);
      return false;
    }
  }, [isAdmin, token, normalizeFormName]);

  // Get specific permissions for a form with enhanced name matching
  const getFormPermissions = useCallback((formName) => {
    if (!formName) {
      return {
        view: false,
        save: false,
        update: false,
        delete: false,
        post: false
      };
    }

    const normalizedFormName = normalizeFormName(formName);

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

    if (!token) return {
      view: false,
      save: false,
      update: false,
      delete: false,
      post: false
    };

    try {
      const decoded = jwtDecode(token);
      
      // Try multiple naming conventions
      const formNameVariations = [
        normalizedFormName,
        normalizedFormName.toLowerCase(),
        normalizedFormName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
        normalizedFormName.replace(/\s+/g, '')
      ];

      const checkPermission = (permission) => {
        return formNameVariations.some(formVar => 
          decoded[`right_${formVar}_${permission}`] === 'true'
        );
      };

      const permissions = {
        view: checkPermission('view'),
        save: checkPermission('save'),
        update: checkPermission('update'),
        delete: checkPermission('delete'),
        post: checkPermission('post')
      };
      
      console.log(`🔍 DEBUG - getFormPermissions "${normalizedFormName}":`, permissions);
      return permissions;
    } catch (error) {
      console.error('🔍 DEBUG - Error getting form permissions:', normalizedFormName, error);
      return {
        view: false,
        save: false,
        update: false,
        delete: false,
        post: false
      };
    }
  }, [isAdmin, token, normalizeFormName]);

  // Get forms by menu category
  const getFormsByMenu = useCallback(() => {
    const menuGroups = {};
    
    allForms.forEach(form => {
      const menu = form.menu || 'Other';
      if (!menuGroups[menu]) {
        menuGroups[menu] = [];
      }
      menuGroups[menu].push(form);
    });

    // Sort forms within each menu by sortOrder
    Object.keys(menuGroups).forEach(menu => {
      menuGroups[menu].sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
    });

    console.log('🔍 DEBUG - Forms grouped by menu:', menuGroups);
    return menuGroups;
  }, [allForms]);

  // Debug all permissions for a user
  const debugAllPermissions = useCallback(() => {
    if (!token) {
      console.log('🔍 DEBUG - No token found for permission debug');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const adminUser = isAdmin();
      
      console.log('\n🎯🎯🎯 COMPREHENSIVE PERMISSION DEBUG 🎯🎯🎯');
      console.log('👤 USER INFO:');
      console.log('   Is Admin:', adminUser ? '✅ YES' : '❌ NO');
      console.log('   User ID:', decoded.nameid || decoded.userId);
      console.log('   Username:', decoded.unique_name);
      
      console.log('\n📋 ALL AVAILABLE FORMS:');
      allForms.forEach((form, index) => {
        console.log(`   ${index + 1}. ${form.formName} (${form.displayName}) - Menu: ${form.menu || 'None'}`);
      });

      console.log('\n🔐 PERMISSION BREAKDOWN:');
      let accessibleForms = 0;
      
      allForms.forEach(form => {
        const formName = form.formName;
        const hasAccess = adminUser ? true : hasAnyPermissionForForm(formName);
        console.log(`   ${formName}: ${hasAccess ? '✅ ACCESS' : '❌ NO ACCESS'}`);
        if (hasAccess) accessibleForms++;
      });

      console.log('\n📊 PERMISSION SUMMARY:');
      console.log(`   Total Forms: ${allForms.length}`);
      console.log(`   Accessible Forms: ${accessibleForms}`);
      console.log(`   Restricted Forms: ${allForms.length - accessibleForms}`);
      console.log(`   Access Rate: ${((accessibleForms / allForms.length) * 100).toFixed(1)}%`);
      
      console.log('\n🎯🎯🎯 END PERMISSION DEBUG 🎯🎯🎯\n');
    } catch (error) {
      console.error('🔍 DEBUG - Error in permission debug:', error);
    }
  }, [token, isAdmin, hasAnyPermissionForForm, allForms]);

  return {
    hasAnyPermissionForForm,
    getFormPermissions,
    isAdmin,
    debugAllPermissions,
    allForms,
    formsLoading,
    getFormsByMenu,
    normalizeFormName
  };
};