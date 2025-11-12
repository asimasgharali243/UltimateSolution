// layout/MainLayout/Sidebar/MenuList/index.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';
import NavGroup from './NavGroup';
import { useMenuItems } from 'menu-items';
import FormNameDebugger from './FormNameDebugger';

const MenuList = () => {
  const menu = useMenuItems();

  if (!menu?.items || !Array.isArray(menu.items) || menu.items.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="body2" color="textSecondary" align="center">
          No menu items available
        </Typography>
      </Box>
    );
  }

  const navItems = menu.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error - {item.type}
          </Typography>
        );
    }
  });

  return (
    <>
      {/* Remove this in production */}
      {/* <FormNameDebugger /> */}
      {navItems}
    </>
  );
};

export default MenuList;
