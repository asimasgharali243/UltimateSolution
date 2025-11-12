// menu-items/index.js
import { useMemo } from 'react';
import { usePermissions } from './customHook/usePermissions';

// assets
import NavigationOutlinedIcon from '@mui/icons-material/NavigationOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import ChromeReaderModeOutlinedIcon from '@mui/icons-material/ChromeReaderModeOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const icons = {
  NavigationOutlinedIcon,
  HomeOutlinedIcon,
  ChromeReaderModeOutlinedIcon,
  HelpOutlineOutlinedIcon,
  SecurityOutlinedIcon,
  AccountTreeOutlinedIcon,
  BlockOutlinedIcon,
  AppsOutlinedIcon,
  ContactSupportOutlinedIcon,
  SettingsOutlinedIcon
};

// Custom hook for menu items
export const useMenuItems = () => {
  const { hasAnyPermissionForForm, isAdmin } = usePermissions();

  const menuItems = useMemo(() => {
    console.log('🔍 DEBUG - Generating menu items with permissions...');
    console.log('🔍 DEBUG - Is Admin:', isAdmin());

    // Define all setup forms with EXACT form names from your database
    const setupForms = [
      { id: 'QueryForm', title: 'Query Form', url: '/dashboard/QueryForm', formName: 'Query' },
      { id: 'Quotation', title: 'Quotation Form', url: '/dashboard/quotation', formName: 'Quotation' },
      { id: 'priceList', title: 'Price List', url: '/dashboard/pricelist', formName: 'PriceList' },
      { id: 'userRightsForm', title: 'User Rights Form', url: '/dashboard/userrightsform', formName: 'UserRights' },
      { id: 'cityForm', title: 'City Form', url: '/dashboard/cityform', formName: 'City' },
      { id: 'hotalForm', title: 'Hotel Form', url: '/dashboard/hotalform', formName: 'Hotel' },
      { id: 'packageForm', title: 'Package Form', url: '/dashboard/packageform', formName: 'Package' },
      { id: 'paxForm', title: 'Pax Form', url: '/dashboard/paxform', formName: 'Pax' },
      { id: 'rateHotal', title: 'Rate Hotel', url: '/dashboard/ratehotal', formName: 'RateHotel' },
      { id: 'rateVisa', title: 'Rate Visa', url: '/dashboard/ratevisa', formName: 'RateVisa' },
      { id: 'sectorForm', title: 'Sector Form', url: '/dashboard/sectorform', formName: 'Sector' },
      { id: 'masterForm', title: 'Master Records', url: '/dashboard/master', formName: 'Advertisement' }
    ];

    // Filter setup children based on permissions
    const setupChildren = setupForms
      .map((form) => {
        const hasPermission = hasAnyPermissionForForm(form.formName);
        console.log(`🔍 DEBUG - Form ${form.formName}: ${hasPermission ? '✅ SHOW' : '❌ HIDE'}`);

        if (hasPermission) {
          return {
            id: form.id,
            title: form.title,
            type: 'item',
            url: form.url,
            target: false
          };
        }
        return null;
      })
      .filter((child) => child !== null);

    console.log('🔍 DEBUG - Setup Children Count:', setupChildren.length);
    console.log('🔍 DEBUG - Setup Children:', setupChildren);

    // Build menu items structure
    const items = [
      {
        id: 'navigation',
        title: 'Materially',
        caption: 'Dashboard',
        type: 'group',
        icon: icons.NavigationOutlinedIcon,
        children: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            icon: icons.HomeOutlinedIcon,
            url: '/dashboard/default'
          }
        ]
      },
      {
        id: 'pages',
        title: 'Pages',
        caption: 'Prebuild Pages',
        type: 'group',
        icon: icons.NavigationOutlinedIcon,
        children: [
          {
            id: 'sample-page',
            title: 'Sample Page',
            type: 'item',
            url: '/sample-page',
            icon: icons.ChromeReaderModeOutlinedIcon
          },
          {
            id: 'auth',
            title: 'Authentication',
            type: 'collapse',
            icon: icons.SecurityOutlinedIcon,
            children: [
              {
                id: 'login-1',
                title: 'Login',
                type: 'item',
                url: '/application/login',
                target: false
              },
              {
                id: 'register',
                title: 'Register',
                type: 'item',
                url: '/application/register',
                target: false
              }
            ]
          },
          // Only show Setup group if it has children with permissions
          ...(setupChildren.length > 0
            ? [
                {
                  id: 'setup',
                  title: 'Setup',
                  type: 'collapse',
                  icon: icons.SettingsOutlinedIcon,
                  children: setupChildren
                }
              ]
            : [])
        ].filter((child) => {
          // Remove empty setup groups
          if (child.id === 'setup' && (!child.children || child.children.length === 0)) {
            console.log('🔍 DEBUG - Removing empty setup group');
            return false;
          }
          return true;
        })
      },
      {
        id: 'utils',
        title: 'Utils',
        type: 'group',
        icon: icons.AccountTreeOutlinedIcon,
        children: [
          {
            id: 'util-icons',
            title: 'Icons',
            type: 'item',
            url: 'https://mui.com/material-ui/material-icons/',
            icon: icons.AppsOutlinedIcon,
            external: true,
            target: true
          },
          {
            id: 'util-typography',
            title: 'Typography',
            type: 'item',
            url: '/utils/util-typography',
            icon: icons.ChromeReaderModeOutlinedIcon
          }
        ]
      },
      {
        id: 'support',
        title: 'Support',
        type: 'group',
        icon: icons.ContactSupportOutlinedIcon,
        children: [
          {
            id: 'disabled-menu',
            title: 'Disabled Menu',
            type: 'item',
            url: '#',
            icon: icons.BlockOutlinedIcon,
            disabled: true
          },
          {
            id: 'documentation',
            title: 'Documentation',
            type: 'item',
            url: 'https://codedthemes.gitbook.io/materially-react-material-documentation/',
            icon: icons.HelpOutlineOutlinedIcon,
            external: true,
            target: true
          }
        ]
      }
    ].filter((item) => {
      // Remove empty groups (like empty pages group if no children)
      if (item.children && item.children.length === 0) {
        console.log(`🔍 DEBUG - Removing empty group: ${item.id}`);
        return false;
      }
      return true;
    });

    console.log('🔍 DEBUG - Final Menu Items Count:', items.length);
    return { items };
  }, [hasAnyPermissionForForm, isAdmin]);

  return menuItems;
};

export default useMenuItems;
