// // // menu-items/index.js
// // import { useMemo, useEffect } from 'react';
// // import { usePermissions } from './customHook/usePermissions';

// // // assets
// // import NavigationOutlinedIcon from '@mui/icons-material/NavigationOutlined';
// // import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
// // import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
// // import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
// // import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
// // import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
// // import ChromeReaderModeOutlinedIcon from '@mui/icons-material/ChromeReaderModeOutlined';
// // import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
// // import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
// // import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

// // const icons = {
// //   NavigationOutlinedIcon,
// //   HomeOutlinedIcon,
// //   ChromeReaderModeOutlinedIcon,
// //   HelpOutlineOutlinedIcon,
// //   SecurityOutlinedIcon,
// //   AccountTreeOutlinedIcon,
// //   BlockOutlinedIcon,
// //   AppsOutlinedIcon,
// //   ContactSupportOutlinedIcon,
// //   SettingsOutlinedIcon
// // };

// // // Custom hook for menu items
// // export const useMenuItems = () => {
// //   const { hasAnyPermissionForForm, isAdmin, debugAllPermissions, allForms, formsLoading } = usePermissions();

// //   console.log('🔍 DEBUG - useMenuItems called');

// //   // Run permission debug when menu loads
// //   useEffect(() => {
// //     if (!formsLoading) {
// //       debugAllPermissions();
// //     }
// //   }, [debugAllPermissions, formsLoading]);

// //   const menuItems = useMemo(() => {
// //     if (formsLoading) {
// //       console.log('🔍 DEBUG - Still loading forms from database...');
// //       return { items: [] };
// //     }

// //     console.log('🔍 DEBUG - Generating menu items with permissions...');
// //     const adminUser = isAdmin();
// //     console.log('🔍 DEBUG - Is Admin:', adminUser);
// //     console.log('🔍 DEBUG - Available forms from database:', allForms);

// //     // Define admin-only forms (forms that are NOT in your database)
// //     const adminOnlyForms = [
// //       { id: 'cityForm', title: 'City Form', url: '/dashboard/cityform', formName: 'City' },
// //       { id: 'hotelForm', title: 'Hotel Form', url: '/dashboard/hotelform', formName: 'Hotel' },
// //       { id: 'packageForm', title: 'Package Form', url: '/dashboard/packageform', formName: 'Package' },
// //       { id: 'paxForm', title: 'Pax Form', url: '/dashboard/paxform', formName: 'Pax' },
// //       { id: 'rateHotel', title: 'Rate Hotel', url: '/dashboard/ratehotelform', formName: 'RateHotel' },
// //       { id: 'rateVisa', title: 'Rate Visa', url: '/dashboard/ratevisaform', formName: 'RateVisa' },
// //       { id: 'sectorForm', title: 'Sector Form', url: '/dashboard/sectorform', formName: 'Sector' },
// //       { id: 'accountForm', title: 'Account Records', url: '/dashboard/accountform', formName: 'Account' },
// //       { id: 'itemGroupForm', title: 'Item Group Form', url: '/dashboard/itemgroupform', formName: 'ItemGroup' },
// //       { id: 'itemCategoryForm', title: 'Item Category Form', url: '/dashboard/itemcategoryform', formName: 'ItemCategory' },
// //       { id: 'stockProductionForm', title: 'Stock Production Form', url: '/dashboard/stockproductionform', formName: 'StockProduction' }
// //     ];

// //     // Generate setup forms from database (excluding UserRights)
// //     const databaseForms = allForms
// //       .filter((form) => form.formName !== 'UserRights')
// //       .map((form) => {
// //         // Map database form names to URLs and titles
// //         let url, title;
// //         switch (form.formName) {
// //           case 'QueryForm':
// //             url = '/dashboard/queryform';
// //             title = 'Query Form';
// //             break;
// //           case 'Quotation':
// //             url = '/dashboard/quotationform';
// //             title = 'Quotation Form';
// //             break;
// //           case 'PrceList': // Note: Typo in database "PrceList" vs "PriceList"
// //             url = '/dashboard/pricelistform';
// //             title = 'Price List';
// //             break;
// //           case 'Advertisement':
// //             url = '/dashboard/masterform';
// //             title = 'Master Records';
// //             break;
// //           case 'Printing':
// //             url = '/dashboard/printingform';
// //             title = 'Printing';
// //             break;
// //           case 'ChangePassword':
// //             url = '/dashboard/changepasswordform';
// //             title = 'Change Password';
// //             break;
// //           case 'Purchase':
// //             url = '/dashboard/purchaseform';
// //             title = 'Purchase';
// //             break;
// //           case 'Invoice':
// //             url = '/dashboard/invoiceform';
// //             title = 'Invoice';
// //             break;
// //           case 'DeliveryNote':
// //             url = '/dashboard/deliverynoteform';
// //             title = 'Delivery Note';
// //             break;
// //           default:
// //             url = `/dashboard/${form.formName.toLowerCase()}form`;
// //             title = form.displayName;
// //         }

// //         return {
// //           id: `${form.formName}Form`,
// //           title: title,
// //           url: url,
// //           formName: form.formName
// //         };
// //       });

// //     console.log('🔍 DEBUG - Database Forms:', databaseForms);
// //     console.log('🔍 DEBUG - Admin Only Forms:', adminOnlyForms);

// //     // User Rights is ONLY for admin users
// //     const hasUserRightsPermission = adminUser;
// //     console.log(`🔍 DEBUG - User Rights Form: ${hasUserRightsPermission ? '✅ SHOW (Admin Only)' : '❌ HIDE'}`);

// //     // For admin: Show ALL forms (database forms + admin-only forms)
// //     // For non-admin: Show only database forms they have permissions for
// //     const setupChildren = adminUser
// //       ? [
// //           ...databaseForms.map((form) => ({
// //             id: form.id,
// //             title: form.title,
// //             type: 'item',
// //             url: form.url,
// //             target: false,
// //             icon: icons.SettingsOutlinedIcon
// //           })),
// //           ...adminOnlyForms.map((form) => ({
// //             id: form.id,
// //             title: form.title,
// //             type: 'item',
// //             url: form.url,
// //             target: false,
// //             icon: icons.SettingsOutlinedIcon,
// //             adminOnly: true // Mark as admin-only for styling if needed
// //           }))
// //         ]
// //       : databaseForms
// //           .map((form) => {
// //             const hasPermission = hasAnyPermissionForForm(form.formName);
// //             console.log(`🔍 DEBUG - Form ${form.formName}: ${hasPermission ? '✅ SHOW' : '❌ HIDE'}`);

// //             if (hasPermission) {
// //               return {
// //                 id: form.id,
// //                 title: form.title,
// //                 type: 'item',
// //                 url: form.url,
// //                 target: false,
// //                 icon: icons.SettingsOutlinedIcon
// //               };
// //             }
// //             return null;
// //           })
// //           .filter((child) => child !== null);

// //     console.log('🔍 DEBUG - Setup Children Count:', setupChildren.length);
// //     console.log('🔍 DEBUG - Setup Children:', setupChildren);

// //     // Build menu items structure
// //     const items = [
// //       {
// //         id: 'navigation',
// //         title: 'Materially',
// //         caption: 'Dashboard',
// //         type: 'group',
// //         icon: icons.NavigationOutlinedIcon,
// //         children: [
// //           {
// //             id: 'dashboard',
// //             title: 'Dashboard',
// //             type: 'item',
// //             icon: icons.HomeOutlinedIcon,
// //             url: '/dashboard/default'
// //           }
// //         ]
// //       },
// //       {
// //         id: 'pages',
// //         title: 'Pages',
// //         caption: 'Prebuild Pages',
// //         type: 'group',
// //         icon: icons.NavigationOutlinedIcon,
// //         children: [
// //           // {
// //           //   id: 'sample-page',
// //           //   title: 'Sample Page',
// //           //   type: 'item',
// //           //   url: '/sample-page',
// //           //   icon: icons.ChromeReaderModeOutlinedIcon
// //           // },
// //           {
// //             id: 'auth',
// //             title: 'Security',
// //             type: 'collapse',
// //             icon: icons.SecurityOutlinedIcon,
// //             children: [
// //               {
// //                 id: 'login-1',
// //                 title: 'Login',
// //                 type: 'item',
// //                 url: '/application/login',
// //                 target: false,
// //                 icon: icons.SecurityOutlinedIcon
// //               },
// //               {
// //                 id: 'register',
// //                 title: 'Register',
// //                 type: 'item',
// //                 url: '/application/register',
// //                 target: false,
// //                 icon: icons.SecurityOutlinedIcon
// //               },
// //               // User Rights Form - ONLY for admin
// //               ...(hasUserRightsPermission
// //                 ? [
// //                     {
// //                       id: 'userRightsForm',
// //                       title: 'User Rights Form',
// //                       type: 'item',
// //                       url: '/dashboard/userrightsform',
// //                       target: false,
// //                       icon: icons.SecurityOutlinedIcon
// //                     }
// //                   ]
// //                 : [])
// //             ]
// //           },
// //           // Setup group - only show if has children with permissions
// //           ...(setupChildren.length > 0
// //             ? [
// //                 {
// //                   id: 'setup',
// //                   title: 'Setup',
// //                   type: 'collapse',
// //                   icon: icons.SettingsOutlinedIcon,
// //                   children: setupChildren
// //                 }
// //               ]
// //             : [])
// //         ].filter((child) => {
// //           // Remove empty setup groups
// //           if (child.id === 'setup' && (!child.children || child.children.length === 0)) {
// //             console.log('🔍 DEBUG - Removing empty setup group');
// //             return false;
// //           }
// //           return true;
// //         })
// //       },
// //       // {
// //       //   id: 'utils',
// //       //   title: 'Utils',
// //       //   type: 'group',
// //       //   icon: icons.AccountTreeOutlinedIcon,
// //       //   children: [
// //       //     {
// //       //       id: 'util-icons',
// //       //       title: 'Icons',
// //       //       type: 'item',
// //       //       url: 'https://mui.com/material-ui/material-icons/',
// //       //       icon: icons.AppsOutlinedIcon,
// //       //       external: true,
// //       //       target: true
// //       //     },
// //       //     {
// //       //       id: 'util-typography',
// //       //       title: 'Typography',
// //       //       type: 'item',
// //       //       url: '/utils/util-typography',
// //       //       icon: icons.ChromeReaderModeOutlinedIcon
// //       //     }
// //       //   ]
// //       // },
// //       {
// //         id: 'support',
// //         title: 'Support',
// //         type: 'group',
// //         icon: icons.ContactSupportOutlinedIcon,
// //         children: [
// //           // {
// //           //   id: 'disabled-menu',
// //           //   title: 'Disabled Menu',
// //           //   type: 'item',
// //           //   url: '#',
// //           //   icon: icons.BlockOutlinedIcon,
// //           //   disabled: true
// //           // },
// //           // {
// //           //   id: 'documentation',
// //           //   title: 'Documentation',
// //           //   type: 'item',
// //           //   url: 'https://codedthemes.gitbook.io/materially-react-material-documentation/',
// //           //   icon: icons.HelpOutlineOutlinedIcon,
// //           //   external: true,
// //           //   target: true
// //           // }
// //         ]
// //       }
// //     ].filter((item) => {
// //       // Remove empty groups
// //       if (item.children && item.children.length === 0) {
// //         console.log(`🔍 DEBUG - Removing empty group: ${item.id}`);
// //         return false;
// //       }
// //       return true;
// //     });

// //     console.log('🔍 DEBUG - Final Menu Items Count:', items.length);
// //     return { items };
// //   }, [hasAnyPermissionForForm, isAdmin, allForms, formsLoading]);

// //   return menuItems;
// // };

// // export default useMenuItems;
// // menu-items/index.js
// import { useMemo, useEffect } from 'react';
// import { usePermissions } from './customHook/usePermissions';

// // assets
// import NavigationOutlinedIcon from '@mui/icons-material/NavigationOutlined';
// import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
// import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
// import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
// import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
// import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
// import ChromeReaderModeOutlinedIcon from '@mui/icons-material/ChromeReaderModeOutlined';
// import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
// import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
// import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

// const icons = {
//   NavigationOutlinedIcon,
//   HomeOutlinedIcon,
//   ChromeReaderModeOutlinedIcon,
//   HelpOutlineOutlinedIcon,
//   SecurityOutlinedIcon,
//   AccountTreeOutlinedIcon,
//   BlockOutlinedIcon,
//   AppsOutlinedIcon,
//   ContactSupportOutlinedIcon,
//   SettingsOutlinedIcon
// };

// // Custom hook for menu items
// export const useMenuItems = () => {
//   const { hasAnyPermissionForForm, isAdmin, debugAllPermissions, allForms, formsLoading } = usePermissions();

//   console.log('🔍 DEBUG - useMenuItems called', allForms);

//   // Run permission debug when menu loads
//   useEffect(() => {
//     if (!formsLoading) {
//       debugAllPermissions();
//     }
//   }, [debugAllPermissions, formsLoading]);

//   const menuItems = useMemo(() => {
//     if (formsLoading) {
//       console.log('🔍 DEBUG - Still loading forms from database...');
//       return { items: [] };
//     }

//     console.log('🔍 DEBUG - Generating menu items with permissions...');
//     const adminUser = isAdmin();
//     console.log('🔍 DEBUG - Is Admin:', adminUser);
//     console.log('🔍 DEBUG - Available forms from database:', allForms);

//     // Define admin-only forms (forms that are NOT in your database)
//     const adminOnlyForms = [
//       { id: 'cityForm', title: 'City Form', url: '/dashboard/cityform', formName: 'City', menu: 'Setup', sortOrder: 1 },
//       { id: 'hotelForm', title: 'Hotel Form', url: '/dashboard/hotelform', formName: 'Hotel', menu: 'Setup', sortOrder: 2 },
//       { id: 'packageForm', title: 'Package Form', url: '/dashboard/packageform', formName: 'Package', menu: 'Setup', sortOrder: 3 },
//       { id: 'paxForm', title: 'Pax Form', url: '/dashboard/paxform', formName: 'Pax', menu: 'Setup', sortOrder: 4 },
//       { id: 'rateHotel', title: 'Rate Hotel', url: '/dashboard/ratehotelform', formName: 'RateHotel', menu: 'Setup', sortOrder: 5 },
//       { id: 'rateVisa', title: 'Rate Visa', url: '/dashboard/ratevisaform', formName: 'RateVisa', menu: 'Setup', sortOrder: 6 },
//       { id: 'sectorForm', title: 'Sector Form', url: '/dashboard/sectorform', formName: 'Sector', menu: 'Setup', sortOrder: 7 },
//       { id: 'accountForm', title: 'Account Records', url: '/dashboard/accountform', formName: 'Account', menu: 'Setup', sortOrder: 8 },
//       {
//         id: 'itemGroupForm',
//         title: 'Item Group Form',
//         url: '/dashboard/itemgroupform',
//         formName: 'ItemGroup',
//         menu: 'Setup',
//         sortOrder: 9
//       },
//       {
//         id: 'itemCategoryForm',
//         title: 'Item Category Form',
//         url: '/dashboard/itemcategoryform',
//         formName: 'ItemCategory',
//         menu: 'Setup',
//         sortOrder: 10
//       },
//       {
//         id: 'stockProductionForm',
//         title: 'Stock Production Form',
//         url: '/dashboard/stockproductionform',
//         formName: 'StockProduction',
//         menu: 'Setup',
//         sortOrder: 11
//       }
//     ];

//     // Generate database forms with ACTUAL menu grouping from database
//     const databaseForms = allForms.map((form) => {
//       // Map database form names to URLs and titles
//       let url, title;
//       switch (form.formName) {
//         case 'QueryForm':
//           url = '/dashboard/queryform';
//           title = 'Query Form';
//           break;
//         case 'Quotation':
//           url = '/dashboard/quotationform';
//           title = 'Quotation Form';
//           break;
//         case 'PrceList': // Note: Typo in database "PrceList" vs "PriceList"
//           url = '/dashboard/pricelistform';
//           title = 'Price List';
//           break;
//         case 'Advertisement':
//           url = '/dashboard/masterform';
//           title = 'Master Records';
//           break;
//         case 'Printing':
//           url = '/dashboard/printingform';
//           title = 'Printing';
//           break;
//         case 'ChangePassword':
//           url = '/dashboard/changepasswordform';
//           title = 'Change Password';
//           break;
//         case 'Purchase':
//           url = '/dashboard/purchaseform';
//           title = 'Purchase';
//           break;
//         case 'Invoice':
//           url = '/dashboard/invoiceform';
//           title = 'Invoice';
//           break;
//         case 'DeliveryNote':
//           url = '/dashboard/deliverynoteform';
//           title = 'Delivery Note';
//           break;
//         default:
//           url = `/dashboard/${form.formName.toLowerCase()}form`;
//           title = form.formDisplayName || form.formName;
//       }

//       // FIX: Use the actual Menu and sortOrder from the database
//       return {
//         id: `${form.formName}Form`,
//         title: title,
//         url: url,
//         formName: form.formName,
//         menu: form.menu || form.Menu || 'Setup', // Use actual menu from database
//         sortOrder: form.sortOrder || 999 // Use actual sortOrder from database
//       };
//     });

//     console.log('🔍 DEBUG - Database Forms:', databaseForms);
//     console.log('🔍 DEBUG - Admin Only Forms:', adminOnlyForms);

//     // User Rights is ONLY for admin users
//     const hasUserRightsPermission = adminUser;
//     console.log(`🔍 DEBUG - User Rights Form: ${hasUserRightsPermission ? '✅ SHOW (Admin Only)' : '❌ HIDE'}`);

//     // Combine database forms and admin-only forms for admin users
//     const allAvailableForms = adminUser ? [...databaseForms, ...adminOnlyForms] : databaseForms;

//     // Group forms by menu and filter by permissions
//     const menuGroups = {};

//     allAvailableForms.forEach((form) => {
//       // For non-admin users, check permissions
//       if (!adminUser && !hasAnyPermissionForForm(form.formName)) {
//         console.log(`🔍 DEBUG - Skipping form ${form.formName} - No permission`);
//         return;
//       }

//       // FIX: Use the actual menu name from the form data
//       const menuName = form.menu || 'Setup';
//       console.log(`🔍 DEBUG - Adding form ${form.formName} to menu ${menuName}`);

//       if (!menuGroups[menuName]) {
//         menuGroups[menuName] = [];
//       }

//       menuGroups[menuName].push({
//         id: form.id,
//         title: form.title,
//         type: 'item',
//         url: form.url,
//         target: false,
//         icon: getFormIcon(form.formName),
//         sortOrder: form.sortOrder
//       });
//     });

//     // Sort each menu group by sortOrder
//     Object.keys(menuGroups).forEach((menuName) => {
//       menuGroups[menuName].sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
//     });

//     console.log('🔍 DEBUG - Menu Groups:', menuGroups);

//     // Build dynamic menu items from groups
//     const dynamicMenuItems = Object.keys(menuGroups).map((menuName) => {
//       const menuChildren = menuGroups[menuName];

//       return {
//         id: menuName.toLowerCase().replace(/\s+/g, '-'),
//         title: menuName,
//         type: 'collapse',
//         icon: getMenuIcon(menuName),
//         children: menuChildren
//       };
//     });

//     console.log('🔍 DEBUG - Dynamic Menu Items:', dynamicMenuItems);

//     // Build menu items structure
//     const items = [
//       {
//         id: 'navigation',
//         title: 'Materially',
//         caption: 'Dashboard',
//         type: 'group',
//         icon: icons.NavigationOutlinedIcon,
//         children: [
//           {
//             id: 'dashboard',
//             title: 'Dashboard',
//             type: 'item',
//             icon: icons.HomeOutlinedIcon,
//             url: '/dashboard/default'
//           }
//         ]
//       },
//       {
//         id: 'pages',
//         title: 'Pages',
//         caption: 'Application Pages',
//         type: 'group',
//         icon: icons.NavigationOutlinedIcon,
//         children: [
//           {
//             id: 'auth',
//             title: 'Security',
//             type: 'collapse',
//             icon: icons.SecurityOutlinedIcon,
//             children: [
//               {
//                 id: 'login-1',
//                 title: 'Login',
//                 type: 'item',
//                 url: '/application/login',
//                 target: false,
//                 icon: icons.SecurityOutlinedIcon
//               },
//               {
//                 id: 'register',
//                 title: 'Register',
//                 type: 'item',
//                 url: '/application/register',
//                 target: false,
//                 icon: icons.SecurityOutlinedIcon
//               },
//               // User Rights Form - ONLY for admin
//               ...(hasUserRightsPermission
//                 ? [
//                     {
//                       id: 'userRightsForm',
//                       title: 'User Rights Form',
//                       type: 'item',
//                       url: '/dashboard/userrightsform',
//                       target: false,
//                       icon: icons.SecurityOutlinedIcon
//                     }
//                   ]
//                 : [])
//             ]
//           },
//           // Add dynamic menu items
//           ...dynamicMenuItems
//         ].filter((child) => {
//           // Remove empty setup groups
//           if (child.children && child.children.length === 0) {
//             console.log(`🔍 DEBUG - Removing empty menu group: ${child.id}`);
//             return false;
//           }
//           return true;
//         })
//       }
//     ].filter((item) => {
//       // Remove empty groups
//       if (item.children && item.children.length === 0) {
//         console.log(`🔍 DEBUG - Removing empty group: ${item.id}`);
//         return false;
//       }
//       return true;
//     });

//     console.log('🔍 DEBUG - Final Menu Items Count:', items.length);
//     return { items };
//   }, [hasAnyPermissionForForm, isAdmin, allForms, formsLoading]);

//   return menuItems;
// };

// // Helper function to get appropriate icons for different menus
// const getMenuIcon = (menuName) => {
//   const iconMap = {
//     Agency: AccountTreeOutlinedIcon,
//     Advertisement: AppsOutlinedIcon,
//     Advertisment: AppsOutlinedIcon, // Handle typo
//     Security: SecurityOutlinedIcon,
//     Transaction: AccountTreeOutlinedIcon,
//     Transacation: AccountTreeOutlinedIcon, // Handle typo
//     Setup: SettingsOutlinedIcon
//   };

//   return iconMap[menuName] || SettingsOutlinedIcon;
// };

// // Helper function to get icons for individual forms
// const getFormIcon = (formName) => {
//   const iconMap = {
//     QueryForm: ChromeReaderModeOutlinedIcon,
//     Quotation: AccountTreeOutlinedIcon,
//     PrceList: AppsOutlinedIcon,
//     Advertisement: AppsOutlinedIcon,
//     Printing: ChromeReaderModeOutlinedIcon,
//     ChangePassword: SecurityOutlinedIcon,
//     Purchase: AccountTreeOutlinedIcon,
//     Invoice: AccountTreeOutlinedIcon,
//     DeliveryNote: AccountTreeOutlinedIcon,
//     UserRights: SecurityOutlinedIcon,
//     City: AccountTreeOutlinedIcon,
//     Hotel: AccountTreeOutlinedIcon,
//     Package: AccountTreeOutlinedIcon,
//     Pax: AccountTreeOutlinedIcon,
//     RateHotel: AccountTreeOutlinedIcon,
//     RateVisa: AccountTreeOutlinedIcon,
//     Sector: AccountTreeOutlinedIcon,
//     Account: AccountTreeOutlinedIcon,
//     ItemGroup: AccountTreeOutlinedIcon,
//     ItemCategory: AccountTreeOutlinedIcon,
//     StockProduction: AccountTreeOutlinedIcon
//   };

//   return iconMap[formName] || SettingsOutlinedIcon;
// };

// export default useMenuItems;

// menu-items/index.js
import { useMemo, useEffect } from 'react';
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
  const { hasAnyPermissionForForm, isAdmin, debugAllPermissions, allForms, formsLoading } = usePermissions();

  console.log('🔍 DEBUG - useMenuItems called', allForms);

  // Run permission debug when menu loads
  useEffect(() => {
    if (!formsLoading) {
      debugAllPermissions();
    }
  }, [debugAllPermissions, formsLoading]);

  const menuItems = useMemo(() => {
    if (formsLoading) {
      console.log('🔍 DEBUG - Still loading forms from database...');
      return { items: [] };
    }

    console.log('🔍 DEBUG - Generating menu items with permissions...');
    const adminUser = isAdmin();
    console.log('🔍 DEBUG - Is Admin:', adminUser);
    console.log('🔍 DEBUG - Available forms from database:', allForms);

    // Define admin-only forms (forms that are NOT in your database)
    const adminOnlyForms = [
      { id: 'cityForm', title: 'City Form', url: '/dashboard/cityform', formName: 'City', menu: 'Setup', sortOrder: 1 },
      { id: 'hotelForm', title: 'Hotel Form', url: '/dashboard/hotelform', formName: 'Hotel', menu: 'Setup', sortOrder: 2 },
      { id: 'packageForm', title: 'Package Form', url: '/dashboard/packageform', formName: 'Package', menu: 'Setup', sortOrder: 3 },
      { id: 'paxForm', title: 'Pax Form', url: '/dashboard/paxform', formName: 'Pax', menu: 'Setup', sortOrder: 4 },
      { id: 'rateHotel', title: 'Rate Hotel', url: '/dashboard/ratehotelform', formName: 'RateHotel', menu: 'Setup', sortOrder: 5 },
      { id: 'rateVisa', title: 'Rate Visa', url: '/dashboard/ratevisaform', formName: 'RateVisa', menu: 'Setup', sortOrder: 6 },
      { id: 'sectorForm', title: 'Sector Form', url: '/dashboard/sectorform', formName: 'Sector', menu: 'Setup', sortOrder: 7 },
      { id: 'accountForm', title: 'Account Records', url: '/dashboard/accountform', formName: 'Account', menu: 'Setup', sortOrder: 8 },
      {
        id: 'itemGroupForm',
        title: 'Item Group Form',
        url: '/dashboard/itemgroupform',
        formName: 'ItemGroup',
        menu: 'Setup',
        sortOrder: 9
      },
      {
        id: 'itemCategoryForm',
        title: 'Item Category Form',
        url: '/dashboard/itemcategoryform',
        formName: 'ItemCategory',
        menu: 'Setup',
        sortOrder: 10
      },
      {
        id: 'stockProductionForm',
        title: 'Stock Production Form',
        url: '/dashboard/stockproductionform',
        formName: 'StockProduction',
        menu: 'Setup',
        sortOrder: 11
      }
    ];

    // Generate database forms with ACTUAL menu grouping from database
    const databaseForms = allForms.map((form) => {
      // Map database form names to URLs and titles
      let url, title;
      switch (form.formName) {
        case 'QueryForm':
          url = '/dashboard/queryform';
          title = 'Query Form';
          break;
        case 'Quotation':
          url = '/dashboard/quotationform';
          title = 'Quotation Form';
          break;
        case 'PrceList': // Note: Typo in database "PrceList" vs "PriceList"
          url = '/dashboard/pricelistform';
          title = 'Price List';
          break;
        case 'Advertisement':
          url = '/dashboard/masterform';
          title = 'Master Records';
          break;
        case 'Printing':
          url = '/dashboard/printingform';
          title = 'Printing';
          break;
        case 'ChangePassword':
          url = '/dashboard/changepasswordform';
          title = 'Change Password';
          break;
        case 'Purchase':
          url = '/dashboard/purchaseform';
          title = 'Purchase';
          break;
        case 'Invoice':
          url = '/dashboard/invoiceform';
          title = 'Invoice';
          break;
        case 'DeliveryNote':
          url = '/dashboard/deliverynoteform';
          title = 'Delivery Note';
          break;
        default:
          url = `/dashboard/${form.formName.toLowerCase()}form`;
          title = form.formDisplayName || form.formName;
      }

      // FIX: Use the actual Menu and sortOrder from the database
      return {
        id: `${form.formName}Form`,
        title: title,
        url: url,
        formName: form.formName,
        menu: form.menu || form.Menu || 'Setup', // Use actual menu from database
        sortOrder: form.sortOrder || 999 // Use actual sortOrder from database
      };
    });

    console.log('🔍 DEBUG - Database Forms:', databaseForms);
    console.log('🔍 DEBUG - Admin Only Forms:', adminOnlyForms);

    // User Rights is ONLY for admin users
    const hasUserRightsPermission = adminUser;
    console.log(`🔍 DEBUG - User Rights Form: ${hasUserRightsPermission ? '✅ SHOW (Admin Only)' : '❌ HIDE'}`);

    // Combine database forms and admin-only forms for admin users
    const allAvailableForms = adminUser ? [...databaseForms, ...adminOnlyForms] : databaseForms;

    // Group forms by menu and filter by permissions
    const menuGroups = {};

    allAvailableForms.forEach((form) => {
      // For non-admin users, check permissions
      if (!adminUser && !hasAnyPermissionForForm(form.formName)) {
        console.log(`🔍 DEBUG - Skipping form ${form.formName} - No permission`);
        return;
      }

      // FIX: Use the actual menu name from the form data
      const menuName = form.menu || 'Setup';
      console.log(`🔍 DEBUG - Adding form ${form.formName} to menu ${menuName}`);

      if (!menuGroups[menuName]) {
        menuGroups[menuName] = [];
      }

      menuGroups[menuName].push({
        id: form.id,
        title: form.title,
        type: 'item',
        url: form.url,
        target: false,
        icon: getFormIcon(form.formName),
        sortOrder: form.sortOrder
      });
    });

    // Sort each menu group by sortOrder
    Object.keys(menuGroups).forEach((menuName) => {
      menuGroups[menuName].sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
    });

    console.log('🔍 DEBUG - Menu Groups:', menuGroups);

    // Build dynamic menu items from groups
    const dynamicMenuItems = Object.keys(menuGroups).map((menuName) => {
      const menuChildren = menuGroups[menuName];

      return {
        id: menuName.toLowerCase().replace(/\s+/g, '-'),
        title: menuName,
        type: 'collapse',
        icon: getMenuIcon(menuName),
        children: menuChildren
      };
    });

    console.log('🔍 DEBUG - Dynamic Menu Items:', dynamicMenuItems);

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
        caption: 'Application Pages',
        type: 'group',
        icon: icons.NavigationOutlinedIcon,
        children: [
          {
            id: 'auth',
            title: 'Security',
            type: 'collapse',
            icon: icons.SecurityOutlinedIcon,
            children: [
              {
                id: 'login-1',
                title: 'Login',
                type: 'item',
                url: '/application/login',
                target: false,
                icon: icons.SecurityOutlinedIcon
              },
              {
                id: 'register',
                title: 'Register',
                type: 'item',
                url: '/application/register',
                target: false,
                icon: icons.SecurityOutlinedIcon
              },
              // User Rights Form - ONLY for admin
              ...(hasUserRightsPermission
                ? [
                    {
                      id: 'userRightsForm',
                      title: 'User Rights Form',
                      type: 'item',
                      url: '/dashboard/userrightsform',
                      target: false,
                      icon: icons.SecurityOutlinedIcon
                    }
                  ]
                : [])
            ]
          },
          // Add dynamic menu items
          ...dynamicMenuItems
        ].filter((child) => {
          // Remove empty setup groups
          if (child.children && child.children.length === 0) {
            console.log(`🔍 DEBUG - Removing empty menu group: ${child.id}`);
            return false;
          }
          return true;
        })
      }
    ].filter((item) => {
      // Remove empty groups
      if (item.children && item.children.length === 0) {
        console.log(`🔍 DEBUG - Removing empty group: ${item.id}`);
        return false;
      }
      return true;
    });

    console.log('🔍 DEBUG - Final Menu Items Count:', items.length);
    return { items };
  }, [hasAnyPermissionForForm, isAdmin, allForms, formsLoading]);

  return menuItems;
};

// Helper function to get appropriate icons for different menus
const getMenuIcon = (menuName) => {
  const iconMap = {
    Agency: AccountTreeOutlinedIcon,
    Advertisement: AppsOutlinedIcon,
    Advertisment: AppsOutlinedIcon, // Handle typo
    Security: SecurityOutlinedIcon,
    Transaction: AccountTreeOutlinedIcon,
    Transacation: AccountTreeOutlinedIcon, // Handle typo
    Setup: SettingsOutlinedIcon
  };

  return iconMap[menuName] || SettingsOutlinedIcon;
};

// Helper function to get icons for individual forms
const getFormIcon = (formName) => {
  const iconMap = {
    QueryForm: ChromeReaderModeOutlinedIcon,
    Quotation: AccountTreeOutlinedIcon,
    PrceList: AppsOutlinedIcon,
    Advertisement: AppsOutlinedIcon,
    Printing: ChromeReaderModeOutlinedIcon,
    ChangePassword: SecurityOutlinedIcon,
    Purchase: AccountTreeOutlinedIcon,
    Invoice: AccountTreeOutlinedIcon,
    DeliveryNote: AccountTreeOutlinedIcon,
    UserRights: SecurityOutlinedIcon,
    City: AccountTreeOutlinedIcon,
    Hotel: AccountTreeOutlinedIcon,
    Package: AccountTreeOutlinedIcon,
    Pax: AccountTreeOutlinedIcon,
    RateHotel: AccountTreeOutlinedIcon,
    RateVisa: AccountTreeOutlinedIcon,
    Sector: AccountTreeOutlinedIcon,
    Account: AccountTreeOutlinedIcon,
    ItemGroup: AccountTreeOutlinedIcon,
    ItemCategory: AccountTreeOutlinedIcon,
    StockProduction: AccountTreeOutlinedIcon
  };

  return iconMap[formName] || SettingsOutlinedIcon;
};

export default useMenuItems;
